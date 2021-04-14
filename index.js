const AWS = require('aws-sdk');
const sharp = require('sharp');

const s3 = new AWS.S3();

exports.handler = async (event, context, callback) => {
    const Bucket = event.Records[0].s3.bucket.name;
    const key = event.Records[0].s3.object.key;
    const filename = key.split('/')[key.split('/').length - 1];
    const ext = key.split('.')[key.split('.').length - 1];
    const requiredFormat = ext === 'jpg' ? 'jpeg' : ext; // sharp 에서는 jpg는 jpeg 를 대신 사용
    console.log('name', filename, 'ext', ext);

    try {
        const s3Object = await s3.getObject({ Bucket, Key }).promise(); // 버퍼로 가져오기
        console.log('original', s3Object.Body.length);
        const resizedImage = await sharp(s3Object.Body) // 리사이징
            .resize(400, 400, { fit: 'inside' } )
            .toFormat(requiredFormat)
            .toBuffer();
        await s3.putObject({ // thumb 폴더에 저장
            bucket,
            key: `thumb/${filename}`,
            body: resizedImage,
        }).promise();
        console.log('put', resizedImage.length);
        return callback(null, `thumb/${filename}`);
    } catch (err) {
        console.error(err);
        return callback(err);
    }
}