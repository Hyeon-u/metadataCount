// const JsonFolder = './metadata';
const fs = require('fs');
const path = require('path')

const fileNames = {
    isMeta: '/metadata.json',
    is_Meta: '/_metadata.json',
}

const csvFileNames = {
    isMeta: '/metadata.csv',
    is_Meta: '/_metadata.csv',
}

let countObj = {}; // 카운트를 세기 위한 오브젝트 { 타입_밸류 : 카운트 }
let types = []; // 타입 종류를 담을 array
let dataLength = 0; // json 리스트 길이

function countJsonMetadata() {
    try {
        const fileName = checkFile();
        const data = fs.readFileSync(path.dirname(process.execPath) + fileName, 'utf8');
        // const data = fs.readFileSync( './metadata.json', 'utf8');
        let csvFileName = '';

        if (data) {
            const jsonData = JSON.parse(data);
            if (fileName === fileNames.isMeta) {
                csvFileName = csvFileNames.isMeta;
                dataLength = jsonData.collection.length;
                for (let i = 0; i < dataLength; i++) {
                    const collection = jsonData.collection[i];
                    makeCollection(collection);
                }
            } else if (fileName === fileNames.is_Meta) {
                csvFileName = csvFileNames.is_Meta;
                dataLength = jsonData.length;
                for (let i = 0; i < dataLength; i++) {
                    const collection = jsonData[i];
                    makeCollection(collection);
                }
            }

            const csvArr = sortJson(countObj, types, dataLength);

            const csv_string = jsonToCSV(csvArr);

            fs.writeFileSync(path.dirname(process.execPath) + csvFileName, csv_string);
        } else {
            console.error('metadata.json File error');
        }
    } catch (e) {
        console.log(e);

    }
}

function makeCollection(collection) {
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
        if (Object.keys(countObj).indexOf(key) < 0 || Object.keys(countObj).indexOf(key) === undefined) {
            // console.log(`for [${key}]: ${result[key]}`);
            countObj[key] = 1;
        } else {
            // console.log(`else [${key}]: ${result[key]}`);
            countObj[key] = countObj[key] + 1;
        }
    })
}

function checkFile() {
    try {
        const isMetadata = fs.existsSync(path.dirname(process.execPath) + '/metadata.json');
        const is_Metadata = fs.existsSync(path.dirname(process.execPath) + '/_metadata.json');
        if (isMetadata) {
            return fileNames.isMeta;
        } else if (is_Metadata) {
            return fileNames.is_Meta;
        } else {
            console.error('No exist Metadata file');
        }
    } catch (e) {
        console.log(e);
    }
}

function sortJson() {
    let csvArr = []; // csv용 array

    for (let i = 0; i < types.length; i++) {
        let tempArr = []; // type별로 묶기 위한 array
        Object.keys(countObj).map(fusionKey => {
            let keyArr = fusionKey.split('-');  // '타입_밸류'를 타입과 밸류로 나눈다

            if (types[i] === (keyArr[0])) {
                let obj = {};
                obj.TYPE = types[i];
                obj.VALUE = keyArr[1];
                obj.COUNT = countObj[fusionKey];
                obj.PERCENT = (countObj[fusionKey] / dataLength * 100).toFixed(2);
                // console.log(obj);
                tempArr.push(obj)
            }

            // VALUE 기준으로 순차정렬 ( 0 -> 1 )
            tempArr.sort(function (a, b) {
                return a.VALUE - b.VALUE;
            });
        });

        for (let x = 0; x < tempArr.length; x++) {
            csvArr.push(tempArr[x]);
        }

        csvArr.push({TYPE: '', VALUE: '', COUNT: '', PERCENT: ''}); // 한가지 타입 정렬이 끝나면 빈 줄을 한 줄 넣는다
    }
    // console.log(csvArr);
    return csvArr;
}


function jsonToCSV(json_data) {

    // 1-1. json 데이터 취득
    const json_array = json_data; // [{}, {}] 형식
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

countJsonMetadata();