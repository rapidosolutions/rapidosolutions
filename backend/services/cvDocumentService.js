import { AppError } from "../utils/http.js";
import { assertDatabaseResult } from "../utils/database.js";

function serializeBranding(row) {
  if (!row) return null;
  return {
    id: row.id,
    logoUrl: row.logo_url,
    logoPublicId: row.logo_public_id,
    collegeName: row.college_name,
    address: row.address,
    footerText: row.footer_text,
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color,
    signatureImageUrl: row.signature_image_url,
    signaturePublicId: row.signature_public_id,
    updatedAt: row.updated_at
  };
}

function serializeTemplate(row) {
  if (!row) return null;
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    bodyHtml: row.body_html,
    createdBy: row.created_by,
    updatedAt: row.updated_at,
    createdAt: row.created_at
  };
}

function serializeDocument(row) {
  if (!row) return null;
  return {
    id: row.id,
    cvId: row.cv_id,
    templateId: row.template_id,
    templateType: row.template_type,
    finalContentHtml: row.final_content_html,
    pdfUrl: row.pdf_url,
    pdfPublicId: row.pdf_public_id,
    generatedBy: row.generated_by,
    generatedAt: row.generated_at
  };
}

function serializeCommunication(row) {
  if (!row) return null;
  return {
    id: row.id,
    cvId: row.cv_id,
    type: row.type,
    subject: row.subject,
    message: row.message,
    sentAt: row.sent_at,
    sentBy: row.sent_by
  };
}

export function fillPlaceholders(html, values = {}) {
  return String(html || "").replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (_, key) => {
    const value = values[key];
    return value == null ? "" : String(value);
  });
}

export function createCvDocumentService({ supabase, uploadService, emailService }) {
  return {
    async getBranding() {
      const { data, error } = await supabase
        .from("branding_settings")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      assertDatabaseResult(error, "Could not load branding settings.");
      if (data) return serializeBranding(data);
      const { data: created, error: insertError } = await supabase
        .from("branding_settings")
        .insert({ college_name: "Rapido Solutions Co." })
        .select("*")
        .single();
      assertDatabaseResult(insertError, "Could not create branding settings.");
      return serializeBranding(created);
    },

    async updateBranding(payload, updatedBy) {
      const current = await this.getBranding();
      const row = {
        logo_url: payload.logoUrl ?? current.logoUrl,
        logo_public_id: payload.logoPublicId ?? current.logoPublicId,
        college_name: payload.collegeName ?? current.collegeName,
        address: payload.address ?? current.address,
        footer_text: payload.footerText ?? current.footerText,
        primary_color: payload.primaryColor ?? current.primaryColor,
        secondary_color: payload.secondaryColor ?? current.secondaryColor,
        signature_image_url: payload.signatureImageUrl ?? current.signatureImageUrl,
        signature_public_id: payload.signaturePublicId ?? current.signaturePublicId,
        updated_by: updatedBy,
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase
        .from("branding_settings")
        .update(row)
        .eq("id", current.id)
        .select("*")
        .single();
      assertDatabaseResult(error, "Could not update branding settings.");
      return serializeBranding(data);
    },

    async listTemplates() {
      const { data, error } = await supabase.from("document_templates").select("*").order("type");
      assertDatabaseResult(error, "Could not list templates.");
      return (data || []).map(serializeTemplate);
    },

    async getTemplate(idOrType) {
      let query = supabase.from("document_templates").select("*");
      query = idOrType.includes("-") || idOrType.length === 36
        ? query.eq("id", idOrType)
        : query.eq("type", idOrType);
      const { data, error } = await query.maybeSingle();
      assertDatabaseResult(error, "Could not load template.");
      if (!data) throw new AppError(404, "Template not found.", "NOT_FOUND");
      return serializeTemplate(data);
    },

    async updateTemplate(id, { title, bodyHtml }, updatedBy) {
      const { data, error } = await supabase
        .from("document_templates")
        .update({
          title,
          body_html: bodyHtml,
          created_by: updatedBy,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select("*")
        .single();
      assertDatabaseResult(error, "Could not update template.");
      return serializeTemplate(data);
    },

    async previewDocument({ templateId, templateType, cv, custom = {}, conditions }) {
      const branding = await this.getBranding();
      let template;
      if (templateId) template = await this.getTemplate(templateId);
      else if (templateType) template = await this.getTemplate(templateType);
      else throw new AppError(400, "Choose a template.", "TEMPLATE_REQUIRED");

      const today = new Date().toISOString().slice(0, 10);
      const values = {
        full_name: custom.fullName || cv?.fullName || "",
        email: custom.email || cv?.email || "",
        phone: custom.phone || cv?.phone || "",
        designation: custom.designation || cv?.designation || "",
        department: custom.department || cv?.category || "",
        category: custom.category || cv?.category || "",
        date: custom.date || today,
        joining_date: custom.joiningDate || today,
        salary: custom.salary || "",
        conditions: conditions ?? custom.conditions ?? "Standard terms and conditions apply.",
        logo: branding.logoUrl
          ? `<img src="${branding.logoUrl}" alt="Logo" style="max-height:64px;" />`
          : "",
        college_name: branding.collegeName,
        address: branding.address,
        footer_text: branding.footerText,
        signature: branding.signatureImageUrl
          ? `<img src="${branding.signatureImageUrl}" alt="Signature" style="max-height:72px;" />`
          : ""
      };

      const body = fillPlaceholders(template.bodyHtml, values);
      const wrapped = `
        <div style="max-width:800px;margin:0 auto;padding:32px;border-top:6px solid ${branding.primaryColor};color:${branding.secondaryColor};">
          <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;gap:16px;">
            <div>${values.logo}</div>
            <div style="text-align:right;">
              <div style="font-size:18px;font-weight:700;">${branding.collegeName}</div>
              <div style="font-size:12px;opacity:.8;">${branding.address}</div>
            </div>
          </header>
          ${body}
          <footer style="margin-top:40px;border-top:1px solid #ddd;padding-top:16px;font-size:12px;">
            <div>${values.signature}</div>
            <p>${branding.footerText}</p>
          </footer>
        </div>`;

      return { html: wrapped, template, branding, values };
    },

    async saveGenerated({ cvId, templateId, templateType, finalContentHtml, pdfBuffer, fileName }, generatedBy) {
      let pdfUrl = "";
      let pdfPublicId = "";
      if (pdfBuffer && uploadService?.uploadRaw) {
        const asset = await uploadService.uploadRaw(
          { buffer: pdfBuffer, mimetype: "application/pdf", originalname: fileName || "document.pdf" },
          { folder: "rapido/generated-docs", resourceType: "raw" }
        );
        pdfUrl = asset.url;
        pdfPublicId = asset.publicId || "";
      }

      const { data, error } = await supabase
        .from("generated_documents")
        .insert({
          cv_id: cvId || null,
          template_id: templateId || null,
          template_type: templateType || "",
          final_content_html: finalContentHtml,
          pdf_url: pdfUrl,
          pdf_public_id: pdfPublicId,
          generated_by: generatedBy
        })
        .select("*")
        .single();
      assertDatabaseResult(error, "Could not save generated document.");
      return serializeDocument(data);
    },

    async listGenerated(cvId) {
      let query = supabase.from("generated_documents").select("*").order("generated_at", { ascending: false }).limit(50);
      if (cvId) query = query.eq("cv_id", cvId);
      const { data, error } = await query;
      assertDatabaseResult(error, "Could not list generated documents.");
      return (data || []).map(serializeDocument);
    },

    async sendEmail({ cvId, to, subject, message }, sentBy) {
      if (!emailService?.sendCustom) {
        throw new AppError(503, "Email delivery is not configured.", "EMAIL_NOT_CONFIGURED");
      }
      await emailService.sendCustom({ to, subject, html: message.replaceAll("\n", "<br>") });
      const { data, error } = await supabase
        .from("communications")
        .insert({
          cv_id: cvId,
          type: "email",
          subject,
          message,
          sent_by: sentBy
        })
        .select("*")
        .single();
      assertDatabaseResult(error, "Could not log communication.");
      return serializeCommunication(data);
    },

    async logWhatsApp({ cvId, message }, sentBy) {
      const { data, error } = await supabase
        .from("communications")
        .insert({
          cv_id: cvId,
          type: "whatsapp",
          subject: "",
          message,
          sent_by: sentBy
        })
        .select("*")
        .single();
      assertDatabaseResult(error, "Could not log WhatsApp communication.");
      return serializeCommunication(data);
    },

    async listCommunications(cvId) {
      const { data, error } = await supabase
        .from("communications")
        .select("*")
        .eq("cv_id", cvId)
        .order("sent_at", { ascending: false })
        .limit(100);
      assertDatabaseResult(error, "Could not list communications.");
      return (data || []).map(serializeCommunication);
    }
  };
}
