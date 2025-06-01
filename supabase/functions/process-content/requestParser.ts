
export async function parseRequestBody<T>(req: Request, actionType: string): Promise<T> {
  try {
    const bodyText = await req.text();
    console.log(`${actionType} raw body:`, bodyText);
    
    if (!bodyText || bodyText.trim() === '') {
      throw new Error(`${actionType} body is empty`);
    }
    
    const body = JSON.parse(bodyText);
    console.log(`${actionType} received:`, body);
    return body;
  } catch (error) {
    console.error(`Error parsing ${actionType} body:`, error);
    throw new Error(`Invalid JSON in ${actionType} body`);
  }
}
