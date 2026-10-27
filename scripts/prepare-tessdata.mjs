// tesseract-rs 0.2.0 downloads these during its build without retries.
// Stage the same data first so a temporary request failure does not discard
// an otherwise successful native compilation.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root =
	process.platform === "darwin"
		? path.join(os.homedir(), "Library", "Application Support", "tesseract-rs")
		: process.platform === "win32"
			? path.join(
					process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"),
					"tesseract-rs",
				)
			: path.join(os.homedir(), ".tesseract-rs");
const directory = path.join(root, "tessdata");
fs.mkdirSync(directory, { recursive: true });
for (const language of ["eng", "tur"]) {
	const destination = path.join(directory, `${language}.traineddata`);
	if (fs.existsSync(destination) && fs.statSync(destination).size > 1024 * 1024)
		continue;
	const temporary = `${destination}.tmp`;
	try {
		execFileSync(
			process.platform === "win32" ? "curl.exe" : "curl",
			[
				"--fail",
				"--location",
				"--retry",
				"5",
				"--retry-all-errors",
				"--connect-timeout",
				"15",
				"--max-time",
				"180",
				"--output",
				temporary,
				`https://raw.githubusercontent.com/tesseract-ocr/tessdata_best/main/${language}.traineddata`,
			],
			{ stdio: "inherit" },
		);
		if (fs.statSync(temporary).size <= 1024 * 1024)
			throw new Error(`Incomplete OCR model: ${language}`);
		fs.renameSync(temporary, destination);
	} finally {
		fs.rmSync(temporary, { force: true });
	}
}
