const qs = require('qs');

try {
    const arr = [];
    console.log('Testing JSON.parse([]):');
    JSON.parse(arr);
    console.log('JSON.parse([]) Success');
} catch (e) {
    console.log('JSON.parse([]) Failed:', e.message);
}

try {
    const arr = ['1', '2'];
    console.log('Testing JSON.parse(["1", "2"]):');
    JSON.parse(arr);
    console.log('JSON.parse(["1", "2"]) Success');
} catch (e) {
    console.log('JSON.parse(["1", "2"]) Failed:', e.message);
}

const parsedArr = qs.parse('contactTag=[]');
console.log('contactTag type:', typeof parsedArr.contactTag);
console.log('contactTag value:', parsedArr.contactTag);

try {
    JSON.parse(parsedArr.contactTag);
    console.log('JSON.parse(contactTag) Success');
} catch (e) {
    console.log('JSON.parse(contactTag) Failed:', e.message);
}
