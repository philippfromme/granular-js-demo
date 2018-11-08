export default async function getData(url) {
  return new Promise((resolve) => {
    const request = new XMLHttpRequest();

    request.open('GET', url, true);

    request.responseType = 'arraybuffer';

    request.onload = function() {
    const audioData = request.response;

    resolve(audioData);
    }

    request.send();
  });
}