'use server';

export async function downloadFile(url, filename) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch file');
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    
    return {
      success: true,
      data: base64,
      contentType: response.headers.get('content-type') || 'application/pdf',
      filename: filename || 'document.pdf'
    };
  } catch (error) {
    console.error('Download Error:', error);
    return { success: false, error: error.message };
  }
}
