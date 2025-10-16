import axios from 'axios';
import fs from 'node:fs';

const config = {
  url: "https://api.docraptor.com/docs",
  method: "post",
  responseType: "arraybuffer",
  headers: {
    "Content-Type": "application/json"
  },
  data: {
    user_credentials: "YOUR_API_KEY_HERE",
    doc: {
      test: true,
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

axios(config)
  .then(function (response) {
    fs.writeFile("src/assets/downloads/guidebook-for-financial-inclusion.pdf", response.data, "binary", function (
      writeErr
    ) {
      if (writeErr) throw writeErr;
      console.log("Saved guidebook-for-financial-inclusion.pdf!");
    });
  })
  .catch(function (error) {
    var decoder = new TextDecoder("utf-8");
    console.log(decoder.decode(error.response.data));
  });
