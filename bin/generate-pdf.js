import axios from 'axios';
import fs from 'node:fs';
import { argv } from 'node:process';
import { exec } from 'node:child_process';
import { rimraf } from 'rimraf';

const user_credentials = process.env.DOCRAPTOR_API_KEY || 'YOUR_API_KEY_HERE';

const config = {
  url: "https://api.docraptor.com/docs",
  method: "post",
  responseType: "arraybuffer",
  headers: {
    "Content-Type": "application/json"
  },
  data: {
    user_credentials,
    doc: {
      test: user_credentials === 'YOUR_API_KEY_HERE' || false,
      document_type: "pdf",
      document_url: "https://financial-inclusion.pages.dev/en/export/index.html",
      pipeline: 11,
      prince_options: {
        media: "print",
        baseurl: "https://financial-inclusion.pages.dev",
      }
    }
  }
};

function princeVersion() {
  return new Promise((resolve) => {
    exec('prince --version', (_error, stdout, _stderr) => {
      resolve(stdout);
    });
  });
}

const local = argv[2] === 'local' || false;

const prince = await princeVersion();

await rimraf('src/assets/downloads/guidebook-for-financial-inclusion.pdf');

if (local && prince.includes('Prince 16')) {
  console.log('Rendering PDF using Prince binary...');
  exec(`prince _site/en/export/index.html -o src/assets/downloads/guidebook-for-financial-inclusion.pdf`, (_error, stdout, _stderr) => {
    console.log("Saved guidebook-for-financial-inclusion.pdf.");
  });
} else {
  console.log('Rendering PDF using DocRaptor API...');
  axios(config)
    .then(function (response) {
      fs.writeFile("src/assets/downloads/guidebook-for-financial-inclusion.pdf", response.data, "binary", function (
        writeErr
      ) {
        if (writeErr) throw writeErr;
        console.log("Saved guidebook-for-financial-inclusion.pdf.");
      });
    })
    .catch(function (error) {
      var decoder = new TextDecoder("utf-8");
      console.error(decoder.decode(error.response.data));
    });
}
