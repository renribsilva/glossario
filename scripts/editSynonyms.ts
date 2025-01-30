import fs from "fs";
import path from "path";
import sinData from "./utils/sinData";

const srcDir = path.join(process.cwd(), "src");
const sinPath = path.join(srcDir, "json", "synonymJson", "sin.json");
const synonymsPath = path.join(srcDir, "json", "synonyms.json");

function createSin() {
    try {
        const rawData = fs.readFileSync(sinPath, "utf8");
        const inputData = JSON.parse(rawData);
        const processedData = sinData(inputData);

        const formattedData = Object.values(processedData).map((entry) => ({
            plain_text: entry.plain_text,
            entries: entry.entries
        }));

        fs.writeFileSync(synonymsPath, JSON.stringify(formattedData, null, 2));
        console.log("synonyms.json criado com sucesso!");
    } catch (error) {
        console.error("Erro ao criar synonyms.json:", error);
    }
}

createSin();
