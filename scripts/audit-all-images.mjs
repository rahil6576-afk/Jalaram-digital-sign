import fs from "fs";
import path from "path";

function findInDir(dir, filter, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const fileStat = fs.statSync(filePath);
    if (fileStat.isDirectory()) {
      findInDir(filePath, filter, fileList);
    } else if (filter.test(filePath)) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const srcFiles = findInDir("src", /\.(tsx|ts|jsx|js)$/);
const hardcodedImages = [];

srcFiles.forEach((file) => {
  const content = fs.readFileSync(file, "utf-8");
  const regex = /['"](\/[^'"]+\.(?:webp|png|jpe?g))['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    hardcodedImages.push({ file: path.relative(process.cwd(), file), img: match[1] });
  }
});

console.log("Hardcoded image strings in src files:", hardcodedImages);

// Check all image files in public
const publicImages = findInDir("public", /\.(webp|png|jpe?g)$/i);
console.log(`Total image files in public/: ${publicImages.length}`);
