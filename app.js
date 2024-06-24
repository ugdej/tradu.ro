const SpeechRecognitionService = window.speechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognitionService) {
  console.error("This browser does not support speech recognition.");
}

const recognitionService = new SpeechRecognitionService();
const startBtn = document.querySelector(".btn-start");
const textLog = document.querySelector(".text-log");
const translateButton = document.querySelector(".btn-translate");
const translationTarget = document.querySelector("#translationTarget");
const targetLanguageSelect = document.querySelector("#targetLanguage");
const speakAutomaticallyButton = document.querySelector("#speakAutomaticallyButton");
const apiKey = "AIzaSyCNXjj7hiFfvKk9zXjhx3l6-icOYxpQWNk";
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
};

startBtn.addEventListener("click", () => {
  if (!recognitionService) {
    return;
  }
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
  return languages[selected] || (() => { throw new Error("Language not supported"); })();
}

function handleResult(event) {
  const results = [];
  for (const result of event.results) {
    results.push(`${result[0].transcript}`);
  }
  textLog.textContent += results.slice(-1)[0];
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

function startRecording() {
  if (isRecording) {
    stopRecording();
  }
  recognitionService.start();
  startBtn.innerText = "Stop";
  isRecording = true;
  textLog.textContent = '';
  translationTarget.textContent = '';
  startBtn.classList.add("btn-pulsating");
}

translateButton.addEventListener("click", () => {
  const textToTranslate = textLog.textContent;

  if (textToTranslate) {
    const targetLanguageCode = targetLanguageSelect.value;
    const sourceLanguageCode = recognitionService.lang;

    if (sourceLanguageCode === targetLanguageCode) {
      translationTarget.textContent = textToTranslate;
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
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        if (response && response.data && response.data.translations && response.data.translations[0]) {
          const translatedText = response.data.translations[0].translatedText;
          translationTarget.textContent = translatedText;
        } else {
          console.error("Invalid response format", response);
        }
      } else {
        console.error("Translation API error", xhr.status, xhr.statusText);
      }
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
  const textToTranslate = textLog.textContent;

  if (textToTranslate) {
    const targetLanguageCode = targetLanguageSelect.value;
    const sourceLanguageCode = recognitionService.lang;

    if (sourceLanguageCode === targetLanguageCode) {
      translationTarget.textContent = textToTranslate;
    } else {
      translateText(textToTranslate, sourceLanguageCode, targetLanguageCode);
    }
  }
});

reverseButton.addEventListener("click", () => {
  const textLogContent = textLog.textContent;
  const translationTargetContent = translationTarget.textContent;

  textLog.textContent = translationTargetContent;
  translationTarget.textContent = textLogContent;
  switchLanguageButton.click();
});

speakAutomaticallyButton.addEventListener("click", () => {
  const textToSpeak = translationTarget.textContent;
  if (textToSpeak) {
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.volume = 1;

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
  const option = Array.from(selector.options).find(opt => opt.text === languageText);
  if (option) {
    option.selected = true;
  }
}
