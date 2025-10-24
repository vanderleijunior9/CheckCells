import express from 'express';
import s3 from simple_s3;

const app = express();

app.use(express.static());

app.get('sign-s3', async (req, res) => {
    const url = await generateUploadUrl();
    res.send({ url });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});