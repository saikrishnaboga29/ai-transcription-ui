document.getElementById('uploadButton').addEventListener('click', uploadFile);
document.getElementById('transcribeButton').addEventListener('click', checkTranscriptionStatus);

let transcriptionJobId = '';

async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file to upload');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    document.getElementById('loader').classList.remove('hidden');

    try {
        const response = await fetch('https://checking-aws-api.vercel.app/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        transcriptionJobId = result.jobId;

        document.getElementById('transcribeButton').disabled = false;
        alert('File uploaded successfully. Click the Transcribe button to start transcription.');
    } catch (error) {
        alert('Error uploading file. Please try again.');
    } finally {
        document.getElementById('loader').classList.add('hidden');
    }
}

async function checkTranscriptionStatus() {
    if (!transcriptionJobId) {
        alert('No transcription job ID found. Please upload a file first.');
        return;
    }

    document.getElementById('loader').classList.remove('hidden');
    document.getElementById('transcriptionOutput').textContent = '';

    let isTranscriptionCompleted = false;
    while (!isTranscriptionCompleted) {
        try {
            const response = await fetch(`https://checking-aws-api.vercel.app/transcription/${transcriptionJobId}`);
            const result = await response.json();

            if (result.transcriptionText) {
                document.getElementById('transcriptionOutput').textContent = result.transcriptionText;
                isTranscriptionCompleted = true;
            } else {
                document.getElementById('transcriptionOutput').textContent = result.message;
            }
        } catch (error) {
            alert('Error fetching transcription status. Please try again.');
            isTranscriptionCompleted = true;
        }

        if (!isTranscriptionCompleted) {
            await new Promise(resolve => setTimeout(resolve, 20000)); // Wait for 20 seconds before checking again
        }
    }

    document.getElementById('loader').classList.add('hidden');
}
