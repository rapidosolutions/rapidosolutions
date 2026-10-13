import React, { forwardRef } from "react";
import rapidoWordmark from "../../assets/logo/rapido-wordmark-cropped.png";
import TechBadges from "./TechBadges";

export const ProposalDocumentPreview = forwardRef(function ProposalDocumentPreview(
  { proposal, hidePrintHeaders = false },
  ref
) {
  if (!proposal) return null;

  const {
    title = "Project Proposal",
    eyebrow = "WEB & DELIVERY TECHNOLOGY PROPOSAL",
    subtitle = "",
    companyDetails = {},
    sections = [],
    terms = [],
    pricing = {},
    acceptance = {}
  } = proposal;

  const currency = pricing.currency || "USD";
  const currencySymbol = currency === "USD" ? "USD " : "PKR ";
  const footerRefText = companyDetails.footerReference || `${companyDetails.preparedBy || "Rapido Solutions Co."} | ${title} Proposal`;

  // Filter sections
  const firstBatchSections = sections.slice(0, 3);
  const secondBatchSections = sections.slice(3);

  return (
    <div ref={ref} className="proposal-document-root font-sans text-slate-900 bg-transparent flex flex-col gap-8 print:gap-0 print:p-0">
      {/* ================= PAGE 1: COVER PAGE ================= */}
      <div className="proposal-a4-page relative mx-auto w-full max-w-[794px] min-h-[1080px] bg-white p-12 sm:p-16 flex flex-col justify-between shadow-2xl rounded-xl border border-slate-200/80 print:shadow-none print:border-none print:rounded-none print:m-0 print:w-full print:min-h-screen print:page-break-after-always">
        {/* Top spacer */}
        <div />

        {/* Center Content */}
        <div className="flex flex-col items-center text-center max-w-xl mx-auto my-auto py-12">
          {/* Main Logo */}
          <div className="mb-14">
            <img
              src={rapidoWordmark}
              alt="Rapido Solutions Co."
              className="h-20 sm:h-24 w-auto object-contain mx-auto"
            />
          </div>

          {/* Eyebrow */}
          {eyebrow && (
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#1D63ED] mb-4">
              {eyebrow}
            </p>
          )}

          {/* Project Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-8">
            {title}
          </h1>

          {/* Subtitle with pipes */}
          {subtitle && (
            <p className="text-xs sm:text-sm font-semibold text-slate-700 tracking-wide mb-12">
              {subtitle}
            </p>
          )}

          {/* Metadata Block */}
          <div className="flex flex-col items-center gap-1 text-xs sm:text-sm text-slate-700 mb-12">
            <p className="font-bold text-slate-900">{companyDetails.preparedBy || "Rapido Solutions Co."}</p>
            {companyDetails.preparedFor && (
              <p className="text-slate-600">Prepared for: <span className="font-semibold text-slate-800">{companyDetails.preparedFor}</span></p>
            )}
            {companyDetails.date && (
              <p className="text-slate-500 font-medium">{companyDetails.date}</p>
            )}
          </div>

          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-xs">
            {companyDetails.upworkUrl ? (
              <a
                href={companyDetails.upworkUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center rounded-xl bg-[#1D63ED] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-700 transition"
              >
                View Our Upwork Profile
              </a>
            ) : null}
            {companyDetails.companyUrl ? (
              <a
                href={companyDetails.companyUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center rounded-xl bg-[#1D63ED] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-700 transition"
              >
                View Our Company Profile
              </a>
            ) : null}
          </div>
        </div>

        {/* Page 1 Footer */}
        <div className="pt-8 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>{footerRefText}</span>
          <span>Page 1</span>
        </div>
      </div>

      {/* ================= PAGE 2: DELIVERABLES & MODULES ================= */}
      <div className="proposal-a4-page relative mx-auto w-full max-w-[794px] min-h-[1080px] bg-white p-10 sm:p-14 flex flex-col justify-between shadow-2xl rounded-xl border border-slate-200/80 print:shadow-none print:border-none print:rounded-none print:m-0 print:w-full print:min-h-screen print:page-break-after-always">
        <div>
          {/* Header with small logo and divider */}
          <div className="pb-4 mb-8 border-b border-slate-300">
            <img src={rapidoWordmark} alt="Rapido Solutions Co." className="h-7 w-auto object-contain" />
          </div>

          {/* Sections list */}
          <div className="space-y-8">
            {firstBatchSections.map((sec) => (
              <SectionRenderer key={sec.id} sec={sec} />
            ))}
          </div>
        </div>

        {/* Page 2 Footer */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 mt-8">
          <span>{footerRefText}</span>
          <span>Page 2</span>
        </div>
      </div>

      {/* ================= PAGE 3: ADMIN CMS & WORKFLOW ================= */}
      {secondBatchSections.length > 0 && (
        <div className="proposal-a4-page relative mx-auto w-full max-w-[794px] min-h-[1080px] bg-white p-10 sm:p-14 flex flex-col justify-between shadow-2xl rounded-xl border border-slate-200/80 print:shadow-none print:border-none print:rounded-none print:m-0 print:w-full print:min-h-screen print:page-break-after-always">
          <div>
            {/* Header */}
            <div className="pb-4 mb-8 border-b border-slate-300">
              <img src={rapidoWordmark} alt="Rapido Solutions Co." className="h-7 w-auto object-contain" />
            </div>

            {/* Sections */}
            <div className="space-y-8">
              {secondBatchSections.map((sec) => (
                <SectionRenderer key={sec.id} sec={sec} />
              ))}
            </div>
          </div>

          {/* Page 3 Footer */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 mt-8">
            <span>{footerRefText}</span>
            <span>Page 3</span>
          </div>
        </div>
      )}

      {/* ================= PAGE 4: TERMS, PAYMENT SCHEDULE & ACCEPTANCE ================= */}
      <div className="proposal-a4-page relative mx-auto w-full max-w-[794px] min-h-[1080px] bg-white p-10 sm:p-14 flex flex-col justify-between shadow-2xl rounded-xl border border-slate-200/80 print:shadow-none print:border-none print:rounded-none print:m-0 print:w-full print:min-h-screen">
        <div>
          {/* Header */}
          <div className="pb-4 mb-6 border-b border-slate-300">
            <img src={rapidoWordmark} alt="Rapido Solutions Co." className="h-7 w-auto object-contain" />
          </div>

          {/* Terms Block */}
          {terms && terms.length > 0 && (
            <div className="space-y-2 mb-8 text-[12px] leading-relaxed text-slate-800">
              {terms.map((term) => (
                <p key={term.id}>
                  <strong className="text-slate-900 font-bold">{term.label}: </strong>
                  <span>{term.text}</span>
                </p>
              ))}
            </div>
          )}

          {/* Payment Schedule Heading */}
          <div className="mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 tracking-tight">
              {pricing.paymentScheduleTitle || "14. Payment Schedule"}
            </h2>

            {/* Payment Schedule Table */}
            {pricing.milestones && pricing.milestones.length > 0 && (
              <div className="overflow-hidden rounded-md border border-slate-200 mb-3">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#1D63ED] text-white">
                      <th className="py-2.5 px-4 font-bold text-center">Milestone</th>
                      <th className="py-2.5 px-4 font-bold text-center">Share</th>
                      <th className="py-2.5 px-4 font-bold text-center">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800 bg-white">
                    {pricing.milestones.map((ms) => (
                      <tr key={ms.id}>
                        <td className="py-2.5 px-4 text-center font-medium">{ms.milestone}</td>
                        <td className="py-2.5 px-4 text-center">{ms.share}</td>
                        <td className="py-2.5 px-4 text-center font-bold text-slate-900">
                          {ms.amount ? `${currencySymbol}${ms.amount}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bank details note */}
            {pricing.paymentDetails && (
              <p className="text-[11px] text-[#1D63ED] leading-normal font-medium">
                {pricing.paymentDetails}
              </p>
            )}
          </div>

          {/* Acceptance & Sign-Off Section */}
          <div className="mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1 tracking-tight">
              {acceptance.sectionNumber ? `${acceptance.sectionNumber}. ` : ""}{acceptance.title || "Acceptance & Sign-Off"}
            </h2>
            {acceptance.description && (
              <p className="text-xs text-slate-700 leading-relaxed mb-4">
                {acceptance.description}
              </p>
            )}

            {/* Sign-off Table */}
            <div className="overflow-hidden rounded-md border border-slate-200 mb-6">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#1D63ED] text-white">
                    <th className="py-2 px-4 font-bold text-center w-1/2">Client / Company</th>
                    <th className="py-2 px-4 font-bold text-center w-1/2">___________________________</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800 bg-white">
                  <tr>
                    <td className="py-2.5 px-4 text-center font-medium">Authorized Person</td>
                    <td className="py-2.5 px-4 text-center text-slate-400 font-mono">___________________________</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-center font-medium">Signature & Date</td>
                    <td className="py-2.5 px-4 text-center text-slate-400 font-mono">___________________________</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-center font-medium">Rapido Solutions Co.</td>
                    <td className="py-2.5 px-4 text-center text-slate-400 font-mono">___________________________</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary Highlight Metric Cards */}
            {pricing.summaryCards && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="rounded-lg bg-[#f0f6ff] border border-blue-200/80 p-3.5 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Custom Development
                  </p>
                  <p className="text-base sm:text-lg font-black text-[#1D63ED] tracking-tight">
                    {currencySymbol}{pricing.summaryCards.customDevAmount || "1,320"}
                  </p>
                </div>
                <div className="rounded-lg bg-[#f0f6ff] border border-blue-200/80 p-3.5 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Timeline
                  </p>
                  <p className="text-base sm:text-lg font-black text-[#1D63ED] tracking-tight">
                    {pricing.summaryCards.timeline || "3 MONTHS"}
                  </p>
                </div>
                <div className="rounded-lg bg-[#f0f6ff] border border-blue-200/80 p-3.5 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Monthly Management
                  </p>
                  <p className="text-base sm:text-lg font-black text-[#1D63ED] tracking-tight">
                    {currencySymbol}{pricing.summaryCards.monthlyManagement || "99 / WEBSITE"}
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Agency Branding & Upwork link */}
            <div className="text-center pt-2">
              <h3 className="text-base sm:text-lg font-bold text-[#1D63ED] mb-1">
                {acceptance.agencyName || "Rapido Solutions Co."}
              </h3>
              <p className="text-xs text-slate-500 mb-1.5 font-medium">
                {acceptance.agencyTagline || "Custom Web Platforms • Delivery Technology • E-Commerce Solutions"}
              </p>
              {companyDetails.upworkUrl && (
                <a
                  href={companyDetails.upworkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-[#1D63ED] underline hover:text-blue-700"
                >
                  {acceptance.agencyUpworkNote || "Visit our Upwork profile for client feedback and work history"}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Page 4 Footer */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 mt-6">
          <span>{footerRefText}</span>
          <span>Page {secondBatchSections.length > 0 ? "4" : "3"}</span>
        </div>
      </div>
    </div>
  );
});

function SectionRenderer({ sec }) {
  if (!sec) return null;
  const headingText = sec.number ? `${sec.number}. ${sec.title}` : sec.title;

  return (
    <div className="space-y-3">
      {/* Numbered Heading */}
      <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
        {headingText}
      </h2>

      {/* Subtitle if any */}
      {sec.subtitle && (
        <p className="text-xs font-semibold text-slate-500">
          {sec.subtitle}
        </p>
      )}

      {/* Rich Text Body */}
      {sec.contentHtml && (
        <div
          className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_strong]:font-bold [&_strong]:text-slate-900"
          dangerouslySetInnerHTML={{ __html: sec.contentHtml }}
        />
      )}

      {/* Table if enabled */}
      {sec.table && sec.table.enabled && sec.table.headers && (
        <div className="overflow-hidden rounded-md border border-slate-200 mt-4">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr
                style={{
                  backgroundColor: sec.table.headerColor || "#1D63ED",
                  color: sec.table.headerTextColor || "#ffffff"
                }}
              >
                {sec.table.headers.map((h, i) => (
                  <th key={i} className="py-2.5 px-4 font-bold text-center">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-slate-800">
              {sec.table.rows &&
                sec.table.rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`py-2.5 px-4 ${cIdx === 1 ? "text-center font-mono font-medium" : "text-left"}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Image if enabled */}
      {sec.image && sec.image.enabled && sec.image.url && (
        <div
          className={`mt-4 flex flex-col ${
            sec.image.align === "left"
              ? "items-start"
              : sec.image.align === "right"
              ? "items-end"
              : "items-center"
          }`}
        >
          <img
            src={sec.image.url}
            alt={sec.image.title || "Section visual"}
            className={`rounded-lg border border-slate-200 object-contain shadow-sm ${
              sec.image.size === "small"
                ? "max-w-[220px]"
                : sec.image.size === "medium"
                ? "max-w-[440px]"
                : "w-full max-w-full"
            }`}
          />
          {sec.image.title && (
            <span className="text-[11px] text-slate-500 font-medium mt-1.5 italic">
              {sec.image.title}
            </span>
          )}
        </div>
      )}

      {/* Tech stack badges if any */}
      {sec.techStack && sec.techStack.length > 0 && (
        <TechBadges items={sec.techStack} className="flex items-center justify-center gap-10 py-6" />
      )}
    </div>
  );
}

export default ProposalDocumentPreview;
