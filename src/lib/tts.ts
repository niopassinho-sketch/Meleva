// --- INICIO DA ALTERAÇÃO ---
/**
 * Módulo de Text-to-Speech (TTS) nativo do navegador.
 * Utilizado para emitir alertas sonoros de segurança e matches.
 */

export const playRideAlert = (
  nome: string,
  idade: number,
  destino: string,
  isFirstRide: boolean
) => {
  if (!('speechSynthesis' in window)) {
    console.warn('Text-to-Speech não suportado neste navegador.');
    return;
  }

  // Cancela qualquer fala anterior para não encavalar os áudios
  window.speechSynthesis.cancel();

  const text = `Atenção motorista. Nova solicitação de carona encontrada. Passageira: ${nome}, ${idade} anos, indo para ${destino}. ${
    isFirstRide ? 'Atenção, esta é a primeira viagem desta pessoa no aplicativo.' : ''
  }`;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pt-BR';
  utterance.rate = 1.0; // Velocidade normal
  utterance.pitch = 1.0; // Tom normal

  // Tenta encontrar uma voz feminina em português (depende do SO/Navegador)
  const voices = window.speechSynthesis.getVoices();
  const ptVoice = voices.find(
    (voice) => voice.lang.includes('pt-BR') && voice.name.toLowerCase().includes('female')
  ) || voices.find((voice) => voice.lang.includes('pt-BR'));

  if (ptVoice) {
    utterance.voice = ptVoice;
  }

  window.speechSynthesis.speak(utterance);
};
// --- FIM DA ALTERAÇÃO ---
