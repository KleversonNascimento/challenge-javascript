const http = require('http');
const axios = require('axios');
const fs = require('fs');
const sha1 = require('js-sha1');
var FormData = require('form-data');

const hostname = '127.0.0.1';
const port = 3000;
const URL_GET = 'https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=d4a66469bc0a7972a54c3a53c211e6e119e32738';
const URL_POST = 'https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=d4a66469bc0a7972a54c3a53c211e6e119e32738';

let response_get = '';

const server =  http.createServer((req, res) => {
  axios.get(URL_GET)
  .then(function (response) {
    response_get = response.data;
    fs.writeFile("./answer.json", JSON.stringify(response_get), function(err) {
      if(err) {
          console.log(err);
      } else {
        console.log('Arquivo salvo');
        const msg_original = response_get.cifrado;
        let msg_deciphered = decipher_message(msg_original);
        response_get.decifrado = msg_deciphered;
        fs.writeFile("./answer.json", JSON.stringify(response_get), function(err) {
          if(err) {
            console.log(err);
          } else {
            console.log('Arquivo salvo');
            response_get.resumo_criptografico = sha1(msg_deciphered);
            fs.writeFile("./answer.json", JSON.stringify(response_get), function(err) {
              if(err) {
                console.log(err);
              } else {
                console.log('Arquivo salvo');

                const form = new FormData();
                form.append('answer', fs.createReadStream("./answer.json"));

                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end(send_file(form));
              }
            });
          }  
        });
      }
    });
  })
  .catch(function (error) {
    console.log(error);
  }); 
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

const send_file = (form) => {
  axios({
    method: 'post',
    url: URL_POST,
    headers: form.getHeaders(),
    data: form,
  })
  .then(function (response) {
    console.log(response);
    return JSON.stringify(response);
  })
  .catch(function (response) {
    console.log(response);
    return JSON.stringify(response);
  });
};

const decipher_message = (msg_original) => {
  let msg_deciphered = '';
  msg_original.split('').forEach((value) => {
    const value_in_ascII = value.charCodeAt(0);
    if (value_in_ascII >= 97 && value_in_ascII <= 122) {
      const new_value_in_ascII = value_in_ascII - response_get.numero_casas;
      if (new_value_in_ascII >= 97 && new_value_in_ascII <= 122) {
        msg_deciphered = msg_deciphered.concat(String.fromCharCode(new_value_in_ascII));
      } else {
        new_value_in_ascII = 123 - (97 - new_value_in_ascII);
        msg_deciphered = msg_deciphered.concat(String.fromCharCode(new_value_in_ascII));
      }
    } else {
      msg_deciphered = msg_deciphered.concat(value);
    }
  });
  return msg_deciphered;
}