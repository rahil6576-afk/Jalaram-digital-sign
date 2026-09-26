import fs from "fs";
import path from "path";

const manifest = JSON.parse(fs.readFileSync("data/cloudinary-manifest.json", "utf-8"));

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
let totalReplaced = 0;

for (const file of srcFiles) {
  let content = fs.readFileSync(file, "utf-8");
  let modified = false;

  for (const [localPath, cloudUrl] of Object.entries(manifest)) {
    // Check if file contains exact quoted string
    const target1 = `"${localPath}"`;
    const target2 = `'${localPath}'`;
    const replacement = `"${cloudUrl}"`;

    if (content.includes(target1)) {
      content = content.replaceAll(target1, replacement);
      modified = true;
      totalReplaced++;
    }
    if (content.includes(target2)) {
      content = content.replaceAll(target2, replacement);
      modified = true;
      totalReplaced++;
    }
  }

  if (modified) {
    fs.writeFileSync(file, content, "utf-8");
    console.log(`Updated: ${path.relative(process.cwd(), file)}`);
  }
}

console.log(`\nReplaced ${totalReplaced} local image paths with Cloudinary URLs across src.`);
