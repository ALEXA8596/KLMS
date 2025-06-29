export async function GET() {
  return Response.json({ message: 'Hello from the API!' });
}

export async function POST(request) {
  const body = await request.json();
  return Response.json({ 
    message: 'Data received',
    data: body 
  });
}
