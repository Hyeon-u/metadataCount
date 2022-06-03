const JsonFolder = './metadata';
const fs = require('fs');
const path = require('path')


const data = fs.readFileSync( path.dirname(process.execPath)+'/metadata.json', 'utf8');
// console.log('data', data);
let result = {};
let types = [];
if (data) {
    const jsonData = JSON.parse(data);
    const dataLength = jsonData.collection.length;
    for (let i = 0; i < dataLength; i++) {
        const collection = jsonData.collection[i];
        // console.log(collection);
        const attributes = collection.attributes;
        // console.log(attributes);
        attributes.map(trait => {
            let type = trait.trait_type;
            let val = trait.value;
            let key = type + '-' + val;
            if (types.indexOf(type) < 0 || types.indexOf(type) === undefined) {
                types.push(type);
            }

            // console.log('trat', Object.keys(result).indexOf(key));
            if (Object.keys(result).indexOf(key) < 0 || Object.keys(result).indexOf(key) === undefined) {
                // console.log(`for [${key}]: ${result[key]}`);
                result[key] = 1;
            } else {
                // console.log(`else [${key}]: ${result[key]}`);
                result[key] = result[key] + 1;
            }
        })

    }
    let csvArr = [];

    // console.log('result', result);
    for (let z = 0; z < types.length; z++) {
        Object.keys(result).map(fusionKey => {
            let keyArr = fusionKey.split('-');
            if (types[z] == (keyArr[0])) {
                // console.log(`[${types[z]}]      ${keyArr[1]}: ${result[fusionKey]}   , ${(result[fusionKey] / dataLength * 100).toFixed(2)} %`);
                let obj = {};
                obj.TYPE = types[z];
                obj.VALUE = keyArr[1];
                obj.COUNT = result[fusionKey];
                obj.PERCENT = (result[fusionKey] / dataLength * 100).toFixed(2);
                csvArr.push(obj)
            }
        })
        // console.log('');
        csvArr.push({TYPE: '', VALUE: '', COUNT: '', PERCENT: ''});
    }
    // console.log(csvArr);
    const csv_string = jsonToCSV(csvArr);

    fs.writeFileSync(path.dirname(process.execPath)+'/metadata.csv', csv_string);
}

function jsonToCSV(json_data) {

    // 1-1. json 데이터 취득
    const json_array = json_data;
    // 1-2. json데이터를 문자열(string)로 넣은 경우, JSON 배열 객체로 만들기 위해 아래 코드 사용
    // const json_array = JSON.parse(json_data);


    // 2. CSV 문자열 변수 선언: json을 csv로 변환한 문자열이 담길 변수
    let csv_string = '';


    // 3. 제목 추출: json_array의 첫번째 요소(객체)에서 제목(머릿글)으로 사용할 키값을 추출
    const titles = Object.keys(json_array[0]);


    // 4. CSV문자열에 제목 삽입: 각 제목은 컴마로 구분, 마지막 제목은 줄바꿈 추가
    titles.forEach((title, index) => {
        csv_string += (index !== titles.length - 1 ? `${title},` : `${title}\r\n`);
    });


    // 5. 내용 추출: json_array의 모든 요소를 순회하며 '내용' 추출
    json_array.forEach((content, index) => {

        let row = ''; // 각 인덱스에 해당하는 '내용'을 담을 행

        for (let title in content) { // for in 문은 객체의 키값만 추출하여 순회함.
            // 행에 '내용' 할당: 각 내용 앞에 컴마를 삽입하여 구분, 첫번째 내용은 앞에 컴마X
            row += (row === '' ? `${content[title]}` : `,${content[title]}`);
        }

        // CSV 문자열에 '내용' 행 삽입: 뒤에 줄바꿈(\r\n) 추가, 마지막 행은 줄바꿈X
        csv_string += (index !== json_array.length - 1 ? `${row}\r\n` : `${row}`);
    })

    // 6. CSV 문자열 반환: 최종 결과물(string)
    return csv_string;
}
