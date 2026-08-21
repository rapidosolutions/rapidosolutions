import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";
import pino from "pino";
import { AppError } from "../utils/http.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length < 8) {
    throw new AppError(400, "Enter a valid phone number with country code.", "INVALID_PHONE");
  }
  return digits;
}

function toJid(phone) {
  return `${normalizePhone(phone)}@s.whatsapp.net`;
}

export function createWhatsAppService({ config, cvDocumentService }) {
  const authDir = config.whatsappAuthDir || path.join(__dirname, "../data/whatsapp-auth");
  const logger = pino({ level: "silent" });

  let sock = null;
  let starting = false;
  let status = "disconnected"; // disconnected | connecting | qr | connected
  let qrDataUrl = "";
  let phoneNumber = "";
  let lastError = "";
  const recentMessages = [];

  function snapshot() {
    return {
      status,
      qrDataUrl: status === "qr" ? qrDataUrl : "",
      phoneNumber,
      lastError,
      recentMessages: recentMessages.slice(0, 40),
      authDir,
      note:
        "Baileys uses an unofficial WhatsApp Web session. Keep the phone online. Re-scan QR after wiping auth or redeploying without persistent disk."
    };
  }

  async function loadBaileys() {
    const mod = await import("@whiskeysockets/baileys");
    return {
      makeWASocket: mod.default,
      useMultiFileAuthState: mod.useMultiFileAuthState,
      DisconnectReason: mod.DisconnectReason,
      fetchLatestBaileysVersion: mod.fetchLatestBaileysVersion,
      Browsers: mod.Browsers
    };
  }

  async function start() {
    if (sock || starting) return snapshot();
    starting = true;
    status = "connecting";
    lastError = "";
    qrDataUrl = "";

    try {
      fs.mkdirSync(authDir, { recursive: true });
      const {
        makeWASocket,
        useMultiFileAuthState,
        DisconnectReason,
        fetchLatestBaileysVersion,
        Browsers
      } = await loadBaileys();

      const { state, saveCreds } = await useMultiFileAuthState(authDir);
      const { version } = await fetchLatestBaileysVersion();

      sock = makeWASocket({
        version,
        auth: state,
        logger,
        printQRInTerminal: false,
        browser: Browsers.ubuntu("Chrome"),
        syncFullHistory: false,
        markOnlineOnConnect: false
      });

      sock.ev.on("creds.update", saveCreds);

      sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          status = "qr";
          qrDataUrl = await QRCode.toDataURL(qr, { margin: 1, width: 320 });
        }

        if (connection === "open") {
          status = "connected";
          qrDataUrl = "";
          phoneNumber = sock?.user?.id?.split(":")?.[0] || sock?.user?.id || "";
          lastError = "";
        }

        if (connection === "close") {
          const code = lastDisconnect?.error?.output?.statusCode;
          const shouldReconnect = code !== DisconnectReason.loggedOut;
          sock = null;
          phoneNumber = "";
          qrDataUrl = "";
          status = "disconnected";

          if (code === DisconnectReason.loggedOut) {
            lastError = "WhatsApp session logged out. Scan a new QR code.";
            try {
              fs.rmSync(authDir, { recursive: true, force: true });
            } catch {
              /* ignore */
            }
          } else {
            lastError = lastDisconnect?.error?.message || "Connection closed.";
            if (shouldReconnect) {
              starting = false;
              setTimeout(() => {
                start().catch((err) => {
                  lastError = err.message;
                  status = "disconnected";
                });
              }, 2500);
              return;
            }
          }
        }
      });
    } catch (err) {
      status = "disconnected";
      lastError = err.message || "Failed to start WhatsApp session.";
      sock = null;
      throw new AppError(500, lastError, "WHATSAPP_START_FAILED");
    } finally {
      starting = false;
    }

    return snapshot();
  }

  async function disconnect({ logout = true } = {}) {
    try {
      if (logout && sock?.logout) await sock.logout();
      else if (sock?.end) sock.end(undefined);
    } catch {
      /* ignore */
    }
    sock = null;
    status = "disconnected";
    qrDataUrl = "";
    phoneNumber = "";
    if (logout) {
      try {
        fs.rmSync(authDir, { recursive: true, force: true });
      } catch {
        /* ignore */
      }
    }
    return snapshot();
  }

  async function sendMessage({ phone, message, cvId, sentBy }) {
    if (status !== "connected" || !sock) {
      throw new AppError(409, "WhatsApp is not connected. Open the portal and scan the QR code first.", "WHATSAPP_NOT_CONNECTED");
    }
    const jid = toJid(phone);
    const text = String(message || "").trim();
    if (!text) throw new AppError(400, "Message is required.", "MESSAGE_REQUIRED");

    await sock.sendMessage(jid, { text });

    const entry = {
      id: crypto.randomUUID(),
      phone: normalizePhone(phone),
      message: text,
      cvId: cvId || null,
      sentAt: new Date().toISOString(),
      sentBy: sentBy || null
    };
    recentMessages.unshift(entry);

    if (cvId && cvDocumentService?.logWhatsApp) {
      await cvDocumentService.logWhatsApp({ cvId, message: text }, sentBy).catch(() => undefined);
    }

    return entry;
  }

  return {
    getStatus: () => snapshot(),
    start,
    disconnect,
    sendMessage,
    normalizePhone
  };
}
