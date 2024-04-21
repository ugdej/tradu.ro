const speechRecognitionService = window.speechRecognition || window.webkitSpeechRecognition;
const recognitionService = new speechRecognitionService();
const startBtn = document.querySelector(".btn-start");
const textLog = document.querySelector(".text-log");
const translateButton = document.querySelector(".btn-translate");
const translationTarget = document.querySelector("#translationTarget");
const targetLanguageSelect = document.querySelector("#targetLanguage");
const speakAutomaticallyButton = document.querySelector("#speakAutomaticallyButton");
const apiKey = "AIzaSyAsqA8ZCq9yH2LXG4S935j3sM8SmGHuEfA";
const reverseButton = document.querySelector("#reverseButton");
const switchLanguageButton = document.querySelector("#switchLanguageButton");
const languageSelect = document.querySelector("#language");

let isRecording = false;

const languages = {
  Romanian: "ro-RO",
  English: "en-GB",
  French: "fr-FR",
  Italian: "it-IT",
  German: "de-DE",
  Spanish: "es-ES",
  Russian: "ru-RU",
  Hungarian: "hu-HU",
  
}

startBtn.addEventListener("click", () => {
  recognitionService.lang = determineLanguage();
  recognitionService.continuous = true;
  recognitionService.onresult = handleResult;

  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
});

function determineLanguage() {
  const selected = languageSelect.value;
  switch (selected) {
    case "Romanian":
      return languages.Romanian;
    case "English":
      return languages.English;
    case "French":
      return languages.French;
    case "Italian":
      return languages.Italian;
    case "German":
      return languages.German;
    case "Spanish":
      return languages.Spanish;
    case "Russian":
      return languages.Russian;
    case "Hungarian":
      return languages.Hungarian;
    default:
      throw new Error("Language not supported");
  }
}

function handleResult(event) {
  const results = [];
  for (const result of event.results) {
    results.push(`${result[0].transcript}`);
  }
  textLog.innerHTML += results.slice(-1)[0];
}

function stopRecording() {
  recognitionService.stop();
  startBtn.innerText = "Start";
  isRecording = false;
  setTimeout(() => {
    translateButton.click();
  }, 1000);
  startBtn.classList.remove("btn-pulsating");
  }
 speakAutomaticallyButton.click();

function startRecording() {
  recognitionService.start();
  startBtn.innerText = "Stop";
  isRecording = true;
  textLog.innerHTML = '';
  translationTarget.innerHTML = '';
  startBtn.classList.add("btn-pulsating");
}

translateButton.addEventListener("click", () => {
  const textToTranslate = textLog.innerHTML;

  if (textToTranslate) {
    const targetLanguageCode = targetLanguageSelect.value;
    const sourceLanguageCode = recognitionService.lang;

    if (sourceLanguageCode === targetLanguageCode) {
      translationTarget.innerHTML = textToTranslate;
    } else {
      translateText(textToTranslate, sourceLanguageCode, targetLanguageCode);
    }
  }
});

function translateText(text, sourceLang, targetLang) {
  const apiUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  const xhr = new XMLHttpRequest();

  xhr.open("POST", apiUrl, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      const translatedText = response.data.translations[0].translatedText;
      translationTarget.innerHTML = translatedText;
    }
  };

  const data = JSON.stringify({
    q: text,
    source: sourceLang,
    target: targetLang,
    format: "text",
  });

  xhr.send(data);
}

textLog.addEventListener("input", () => {
  const textToTranslate = textLog.innerText;

  if (textToTranslate) {
    const targetLanguageCode = targetLanguageSelect.value;
    const sourceLanguageCode = recognitionService.lang;

    if (sourceLanguageCode === targetLanguageCode) {
      translationTarget.innerText = textToTranslate;
    } else {
      translateText(textToTranslate, sourceLanguageCode, targetLanguageCode);
    }
  }
});

reverseButton.addEventListener("click", () => {
  const textLogContent = textLog.innerHTML;
  const translationTargetContent = translationTarget.innerHTML;

  textLog.innerHTML = translationTargetContent;
  translationTarget.innerHTML = textLogContent;
  switchLanguageButton.click();
});

speakAutomaticallyButton.addEventListener("click", () => {
  const translationTarget = document.querySelector("#translationTarget");
  const volume = 1;

  if (translationTarget) {
    const textToSpeak = translationTarget.textContent;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.volume = volume;

    const targetLanguageCode = targetLanguageSelect.value;

    utterance.lang = targetLanguageCode;
    utterance.rate = 0.7;

    window.speechSynthesis.speak(utterance);
  }
});

switchLanguageButton.addEventListener("click", () => {
  const selectedLanguageText = languageSelect.options[languageSelect.selectedIndex].text;
  const selectedTargetLanguageText = targetLanguageSelect.options[targetLanguageSelect.selectedIndex].text;

  if (selectedLanguageText !== selectedTargetLanguageText) {
    selectLanguageByText(languageSelect, selectedTargetLanguageText);

    selectLanguageByText(targetLanguageSelect, selectedLanguageText);
  } else {
    selectLanguageByText(targetLanguageSelect, selectedLanguageText);

    selectLanguageByText(languageSelect, selectedTargetLanguageText);
  }

  if (isRecording) {
    startRecording();
  }
});

function selectLanguageByText(selector, languageText) {
  const option = Array.from(selector.options).find((opt) => opt.text === languageText);
  if (option) {
    option.selected = true;
  }
}

