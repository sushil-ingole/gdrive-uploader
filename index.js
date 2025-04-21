const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());

const upload = multer({ dest: 'uploads/' });

// Google Drive auth
const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/drive'],
});
const drive = google.drive({ version: 'v3', auth });

app.get('/test', (req, res) => {
    res.send('Hello World!');
});

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const fileMetadata = {
            name: req.file.originalname,
            parents: ['152V3rU6x0FWIGMmg_Mr7S2q2jUyD-_sw'], // Get it from Google Drive folder URL
        };

        const media = {
            mimeType: req.file.mimetype,
            body: fs.createReadStream(req.file.path),
        }; ``

        const file = await drive.files.create({
            resource: fileMetadata,
            media,
            fields: 'id',
        });

        // Make file public
        await drive.permissions.create({
            fileId: file.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        const fileUrl = `https://drive.google.com/uc?id=${file.data.id}&export=view`;
        fs.unlinkSync(req.file.path); // cleanup local file

        res.json({ url: fileUrl });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error uploading file');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));