import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get('url');

  if (!fileUrl) {
    return new NextResponse('Missing URL', { status: 400 });
  }

  try {
    let finalUrl = fileUrl;

    // Check if it's a Cloudinary URL to apply signing
    if (fileUrl.includes('res.cloudinary.com')) {
      const parts = fileUrl.split('/');
      const uploadIndex = parts.indexOf('upload');
      if (uploadIndex !== -1) {
        // Extract public_id and extension
        // Format is usually .../upload/v123456/public_id.ext
        // We want everything after the version (v...) or after /upload/
        let publicIdWithExt = parts.slice(uploadIndex + 2).join('/');
        const publicId = publicIdWithExt.split('.')[0];
        
        console.log('--- GENERATING SIGNED URL FOR ---', publicId);
        
        finalUrl = cloudinary.url(publicId, {
          sign_url: true,
          type: 'upload',
          resource_type: 'image', // In your case it was under /image/upload
          secure: true
        });
        
        console.log('--- SIGNED URL ---', finalUrl);
      }
    }

    const response = await fetch(finalUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error('--- FETCH ERROR ---', response.status);
      return new NextResponse(`Error: ${response.status} from source.`, { status: response.status });
    }

    const data = await response.arrayBuffer();

    return new NextResponse(data, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Rohan_Mia_Resume.pdf"`,
      },
    });
  } catch (error) {
    console.error('--- DOWNLOAD SYSTEM ERROR ---', error);
    return new NextResponse('Error: ' + error.message, { status: 500 });
  }
}
