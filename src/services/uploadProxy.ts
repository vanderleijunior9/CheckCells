// Alternative upload method using backend proxy
export async function uploadVideoViaProxy(videoBlob: Blob, testId: string, recordingNumber: number) {
  const formData = new FormData();
  formData.append('video', videoBlob, `video_${recordingNumber}.webm`);
  formData.append('testId', testId);
  formData.append('recordingNumber', recordingNumber.toString());

  const response = await fetch('/api/upload/video', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }

  const result = await response.json();
  return result.url;
}
