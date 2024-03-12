import {
  ObjectCannedACL,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';
import { FailedToUploadFileException } from 'src/exceptions/FailedToUploadFile.exception';
import { UploadedFileNotFoundError } from 'src/exceptions/UploadedFileNotFoundError.exception';

export default async function uploadImageToS3(
  file: Express.Multer.File,
  folder: string,
) {
  if (!file) throw new UploadedFileNotFoundError();

  const fileNameBase = nanoid();
  const extension = file.originalname.split('.').splice(-1);
  const fileName = `${fileNameBase}.${extension}`;

  const awsRegion = process.env.AWS_REGION || '';
  const bucketName = process.env.AWS_S3_BUCKET_NAME || '';
  const client = new S3Client({
    region: awsRegion,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY || '',
      secretAccessKey: process.env.AWS_SECRET_KEY || '',
    },
  });

  const key = `cultureland/${folder}/${Date.now().toString()}-${fileName}`;
  const params: PutObjectCommandInput = {
    Key: key,
    Body: file.buffer,
    Bucket: bucketName,
    ACL: ObjectCannedACL.public_read,
  };
  const command = new PutObjectCommand(params);

  const uploadFileS3 = await client.send(command);

  if (uploadFileS3.$metadata.httpStatusCode !== 200)
    throw new FailedToUploadFileException();
  const imgUrl = `${key}`;
  return imgUrl;
}
