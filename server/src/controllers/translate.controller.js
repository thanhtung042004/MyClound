const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Helper: Convert buffer to Gemini inline data part
 */
function bufferToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType,
    },
  };
}

/**
 * POST /api/translate/image
 * Body: multipart/form-data – field "file" (image)
 * Returns: { detectedLanguage, originalText, translatedText }
 */
const translateImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng upload một file ảnh.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: 'GEMINI_API_KEY chưa được cấu hình.' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const imagePart = bufferToGenerativePart(req.file.buffer, req.file.mimetype);

    const prompt = `Bạn là một chuyên gia dịch thuật. Hãy phân tích hình ảnh này và thực hiện các bước sau:

1. Trích xuất toàn bộ văn bản (nếu có) từ hình ảnh
2. Xác định ngôn ngữ của văn bản đó
3. Dịch toàn bộ nội dung sang Tiếng Việt

Trả lời theo đúng định dạng JSON sau (không thêm gì khác):
{
  "detectedLanguage": "tên ngôn ngữ phát hiện được bằng tiếng Việt (ví dụ: Tiếng Anh, Tiếng Nhật, Tiếng Hàn...)",
  "detectedLanguageCode": "mã ngôn ngữ ISO (ví dụ: en, ja, ko...)",
  "originalText": "toàn bộ văn bản gốc trích xuất từ ảnh",
  "translatedText": "bản dịch sang Tiếng Việt",
  "hasText": true hoặc false (ảnh có chứa văn bản không),
  "imageDescription": "mô tả ngắn gọn nội dung hình ảnh bằng Tiếng Việt (1-2 câu)"
}

Nếu ảnh không chứa văn bản, đặt hasText = false, originalText = "", translatedText = "" và mô tả hình ảnh.`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Parse JSON from Gemini response (strip markdown code fences if any)
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback: return raw text
      parsed = {
        detectedLanguage: 'Không xác định',
        detectedLanguageCode: 'unknown',
        originalText: text,
        translatedText: text,
        hasText: true,
        imageDescription: '',
      };
    }

    return res.json({ success: true, data: parsed });
  } catch (error) {
    console.error('translateImage error:', error);
    if (error.status === 429) {
      return res.status(429).json({ success: false, message: 'Đã vượt quá giới hạn API. Vui lòng thử lại sau.' });
    }
    return res.status(500).json({ success: false, message: 'Lỗi khi xử lý ảnh: ' + (error.message || 'Unknown error') });
  }
};

/**
 * POST /api/translate/video
 * Body: multipart/form-data – field "file" (video)
 * Returns: { description, translatedDescription, duration }
 *
 * Note: Gemini 1.5 Flash supports video via File API for files > 20MB.
 * For small videos (< 20MB) we can use inline data.
 * For larger videos we use the Gemini Files API.
 */
const translateVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng upload một file video.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: 'GEMINI_API_KEY chưa được cấu hình.' });
    }

    const fileSize = req.file.size;
    const MAX_INLINE_SIZE = 18 * 1024 * 1024; // 18 MB

    if (fileSize > MAX_INLINE_SIZE) {
      return res.status(413).json({
        success: false,
        message: 'File video quá lớn (tối đa 18MB cho phương thức này). Vui lòng dùng video ngắn hơn.',
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const videoPart = bufferToGenerativePart(req.file.buffer, req.file.mimetype);

    const prompt = `Bạn là một chuyên gia phân tích và dịch thuật đa phương tiện. Hãy phân tích video này và thực hiện:

1. Ghi nhận tất cả lời thoại, subtitle, hoặc văn bản xuất hiện trong video
2. Xác định ngôn ngữ chính trong video
3. Dịch toàn bộ nội dung sang Tiếng Việt
4. Mô tả tổng quan nội dung video

Trả lời theo đúng định dạng JSON sau (không thêm gì khác):
{
  "detectedLanguage": "tên ngôn ngữ phát hiện được bằng tiếng Việt",
  "detectedLanguageCode": "mã ngôn ngữ ISO",
  "originalText": "toàn bộ lời thoại / subtitle / văn bản gốc trong video",
  "translatedText": "bản dịch sang Tiếng Việt",
  "hasAudio": true hoặc false (video có âm thanh/lời nói không),
  "hasText": true hoặc false (video có subtitle/text không),
  "videoDescription": "mô tả nội dung video bằng Tiếng Việt (2-3 câu)",
  "translatedDescription": "mô tả bằng tiếng Việt"
}`;

    const result = await model.generateContent([prompt, videoPart]);
    const response = await result.response;
    const text = response.text();

    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        detectedLanguage: 'Không xác định',
        detectedLanguageCode: 'unknown',
        originalText: text,
        translatedText: text,
        hasAudio: true,
        hasText: false,
        videoDescription: '',
        translatedDescription: text,
      };
    }

    return res.json({ success: true, data: parsed });
  } catch (error) {
    console.error('translateVideo error:', error);
    if (error.status === 429) {
      return res.status(429).json({ success: false, message: 'Đã vượt quá giới hạn API. Vui lòng thử lại sau.' });
    }
    return res.status(500).json({ success: false, message: 'Lỗi khi xử lý video: ' + (error.message || 'Unknown error') });
  }
};

module.exports = { translateImage, translateVideo };
