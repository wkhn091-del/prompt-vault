import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "content", "courses");
const he = { א: 0, ב: 1, ג: 2, ד: 3 };

const sitesLetters = {
  "st-1": "בבב",
  "st-2": "בבא",
  "st-3": "בבב",
  "st-4": "גבא",
  "st-5": "בבב",
  "st-6": "אאא",
  "st-7": "באב",
  "st-8": "בבא",
  "st-9": "באב",
  "st-10": "באג",
  "st-11": "באב",
  "st-12": "בבא",
  "st-13": "באא",
  "st-14": "באא",
  "st-15": "אגג",
  "st-16": "גבא",
  "st-17": "באג",
  "st-18": "אגא",
  "st-19": "גאג",
  "st-20": "גגב",
  "st-21": "בגב",
  "st-22": "בגב",
  "st-23": "אאג",
  "st-24": "אאג",
  "st-25": "אבב",
  "st-26": "באב",
  "st-27": "בבב",
  "st-28": "גגג",
  "st-29": "גאא",
  "st-30": "אגב",
  "st-31": "גאב",
  "st-32": "באג",
  "st-33": "בגב",
  "st-34": "באא",
  "st-34א": "באב",
  "st-35": "באא",
  "st-36": "גבב",
  "st-37": "אאא",
  "st-37א": "אבא",
  "st-37ב": "באב",
  "st-37ג": "אבג",
  "st-38": "גאב",
  "st-39": "אגג",
  "st-40": "גאב",
  "st-41": "גגב",
  "st-42": "גבא",
  "st-43": "אבג",
  "st-44": "אגב",
  "st-45": "בבא",
  "st-46": "באג",
  "st-47": "בגא",
  "st-48": "גגג",
  "st-49": "גאא",
  "st-50": "באב",
};

const agentsLetters = {
  "st-1": "בבב",
  "st-2": "בבא",
  "st-3": "בבא",
  "st-4": "אבב",
  "st-5": "אבב",
  "st-6": "בבא",
  "st-7": "באב",
  "st-8": "בבב",
  "st-9": "בבב",
  "st-10": "בבב",
  "st-11": "באב",
  "st-12": "באב",
  "st-13": "בבא",
  "st-14": "בבא",
  "st-15": "אאב",
  "st-16": "בבא",
  "st-17": "בבב",
  "st-18": "באב",
  "st-19": "אבב",
  "st-20": "בבא",
  "st-21": "באא",
  "st-22": "אאב",
  "st-23": "אאב",
  "st-24": "אאא",
  "st-25": "אבב",
  "st-26": "באב",
  "st-27": "בבא",
  "st-28": "בבא",
};

function toAnswers(lettersMap, quizzes) {
  const out = {};
  for (const [id, letters] of Object.entries(lettersMap)) {
    const qs = quizzes[id];
    if (!qs) {
      console.warn("skip missing quiz", id);
      continue;
    }
    if (letters.length !== qs.length) {
      throw new Error(`${id}: letters ${letters.length} vs qs ${qs.length}`);
    }
    out[id] = [...letters].map((ch, i) => {
      const idx = he[ch];
      if (idx == null || idx >= qs[i].choices.length) {
        throw new Error(`bad answer ${id} Q${i + 1} ${ch}`);
      }
      return idx;
    });
  }
  return out;
}

const sitesQ = JSON.parse(
  fs.readFileSync(path.join(dir, "sites-quizzes.json"), "utf8"),
);
const agentsQ = JSON.parse(
  fs.readFileSync(path.join(dir, "agents-quizzes.json"), "utf8"),
);

for (const id of Object.keys(agentsQ)) {
  if (!agentsLetters[id]) {
    agentsLetters[id] = agentsQ[id]
      .map((q) => q.choices[Math.min(1, q.choices.length - 1)].letter)
      .join("");
    console.warn("fallback agents", id, agentsLetters[id]);
  }
}

fs.writeFileSync(
  path.join(dir, "sites-quiz-answers.json"),
  JSON.stringify(toAnswers(sitesLetters, sitesQ), null, 2),
);
fs.writeFileSync(
  path.join(dir, "agents-quiz-answers.json"),
  JSON.stringify(toAnswers(agentsLetters, agentsQ), null, 2),
);
console.log(
  "ok sites",
  Object.keys(sitesLetters).length,
  "agents",
  Object.keys(agentsLetters).length,
);
