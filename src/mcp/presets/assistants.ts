/**
 * Vorgefertigte Agent-Presets für create_assistant_from_preset.
 * Minimal config compatible with Vapi create assistant API.
 */

export type PresetId = 'support' | 'recruiting' | 'appointment';

export interface AssistantPreset {
  id: PresetId;
  name: string;
  description: string;
  firstMessage: string;
  systemPrompt: string;
  model: { provider: string; model: string };
  voice: { provider: string; voiceId: string };
}

export const ASSISTANT_PRESETS: Record<PresetId, AssistantPreset> = {
  support: {
    id: 'support',
    name: 'Customer Support Agent',
    description: 'Kundenservice: Begrüßung, Anliegen erfassen, ggf. Ticket erstellen.',
    firstMessage: 'Hallo, Sie sprechen mit dem Kundenservice. Wie kann ich Ihnen helfen?',
    systemPrompt: `Du bist ein freundlicher Kundenservice-Mitarbeiter. 
- Begrüße den Anrufer kurz.
- Frage nach dem Anliegen und fasse es zusammen.
- Wenn der Kunde ein Ticket oder Rückruf wünscht, bestätige die Kontaktdaten.
- Halte Antworten kurz und klar (Sprache: Deutsch).`,
    model: { provider: 'openai', model: 'gpt-4o' },
    voice: { provider: '11labs', voiceId: 'cgSgspJ2msm6clMCkdW9' },
  },
  recruiting: {
    id: 'recruiting',
    name: 'Recruiting / Bewerbungs-Agent',
    description: 'Erstgespräch Bewerbung: Kurze Einführung, Verfügbarkeit, nächste Schritte.',
    firstMessage: 'Hallo, vielen Dank für Ihr Interesse. Ich führe Sie kurz durch ein paar Fragen. Sind Sie bereit?',
    systemPrompt: `Du bist ein freundlicher Recruiting-Assistent für Erstgespräche.
- Stelle dich kurz vor und erkläre, dass du ein paar kurze Fragen stellst.
- Frage nach Verfügbarkeit und Gehaltswunsch nur wenn es passt.
- Fasse am Ende zusammen und nenne den nächsten Schritt (z.B. Rückruf durch HR).
- Halte das Gespräch kurz und professionell (Sprache: Deutsch).`,
    model: { provider: 'openai', model: 'gpt-4o' },
    voice: { provider: '11labs', voiceId: 'cgSgspJ2msm6clMCkdW9' },
  },
  appointment: {
    id: 'appointment',
    name: 'Termin-Erinnerung Agent',
    description: 'Terminerinnerung: Anruf mit Datum/Uhrzeit, Bestätigung oder Verschiebung.',
    firstMessage: 'Hallo, hier ist Ihre Terminerinnerung. Haben Sie einen Moment?',
    systemPrompt: `Du bist ein Termin-Erinnerungs-Assistent.
- Nenne Datum und Uhrzeit des Termins (nutze ggf. {{variableName}} wenn vom Aufruf übergeben).
- Frage ob der Termin bestätigt wird oder verschoben werden soll.
- Bei Bestätigung: kurze Bestätigung aussprechen. Bei Verschiebung: sagen, dass sich jemand meldet.
- Halte den Anruf kurz (Sprache: Deutsch).`,
    model: { provider: 'openai', model: 'gpt-4o' },
    voice: { provider: '11labs', voiceId: 'cgSgspJ2msm6clMCkdW9' },
  },
};

export function listPresets(): { presets: AssistantPreset[] } {
  return { presets: Object.values(ASSISTANT_PRESETS) };
}

export function getPreset(presetId: string): AssistantPreset | null {
  const id = presetId.toLowerCase() as PresetId;
  return ASSISTANT_PRESETS[id] ?? null;
}
