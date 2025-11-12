import axios from 'axios';
import { exec } from 'node:child_process';
import { writeFile } from 'node:fs';
import { argv } from 'node:process';

const user_credentials = process.env.DOCRAPTOR_API_KEY || 'YOUR_API_KEY_HERE';

const languages = {
  "en": "guidebook-for-financial-inclusion",
  "fr": "guide-pour-l-inclusion-financiere"
};

const docraptorConfig = (lang) => {
  return {
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
        document_url: `https://financial-inclusion.inclusivedesign.ca/${lang}/export/index.html`,
        pipeline: 11,
        prince_options: {
          media: "print",
          baseurl: "https://financial-inclusion.inclusivedesign.ca/",
          profile: "PDF/UA-1"
        }
      }
    }
  };
}

if (argv[2] === 'local') {
  console.log('Rendering PDFs using Prince...');

  for (const [lang, filename] of Object.entries(languages)) {
    exec(`prince --pdf-profile='PDF/UA-1' http://localhost:8080/${lang}/export/ -o src/assets/downloads/${filename}.pdf`, (_error, stdout, _stderr) => {
      console.log(`Saved ${filename}.pdf.`);
    });
  }
} else {
  console.log('Rendering PDFs using DocRaptor...');

  for (const [lang, filename] of Object.entries(languages)) {
    axios(docraptorConfig(lang))
      .then(function (response) {
        writeFile(`./src/assets/downloads/${filename}.pdf`, response.data, "binary", function (
          writeErr
        ) {
          if (writeErr) throw writeErr;
          console.log(`Saved ${filename}.pdf.`);
        });
      })
      .catch(function (error) {
        var decoder = new TextDecoder("utf-8");
        console.error(decoder.decode(error.response.data));
      });
  }
}
