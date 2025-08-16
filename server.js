const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'EcoVista API is running perfectly on Vercel!',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        server: 'Vercel'
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        platform: 'Vercel',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production'
    });
});

// Wallpaper generation endpoint
app.post('/api/v1/generate-wallpaper', async (req, res) => {
    try {
        console.log('🎨 Wallpaper generation request received');
        
        const { prompt, user_id } = req.body;
        
        // Validate input
        if (!prompt || prompt.trim().length < 3) {
            return res.status(400).json({
                error: 'Please provide a description (at least 3 characters)',
                code: 'INVALID_PROMPT'
            });
        }
        
        // Check if API key is configured
        if (!process.env.DUMPLING_AI_KEY) {
            console.error('❌ DUMPLING_AI_KEY not configured');
            return res.status(503).json({
                error: 'AI service is being configured. Please try again in a few minutes.',
                code: 'SERVICE_UNAVAILABLE'
            });
        }
        
        // Enhanced prompt for nature wallpapers
        const enhancedPrompt = `${prompt}, beautiful nature wallpaper, high quality, mobile wallpaper, 4K resolution, stunning natural scenery, peaceful and serene`;
        
        console.log('📝 Enhanced prompt:', enhancedPrompt);
        console.log('👤 User ID:', user_id);
        
        // Dynamic import for Vercel
        const axios = (await import('axios')).default;
        
        // Call DumplingAI API
        const response = await axios.post('https://app.dumplingai.com/api/v1/generate-ai-image', {
            model: "FLUX.1-schnell",
            input: {
                prompt: enhancedPrompt,
                num_outputs: 1,
                aspect_ratio: "9:16",
                output_format: "webp",
                output_quality: 90
            }
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.DUMPLING_AI_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
        
        console.log('✅ DumplingAI API response received');
        
        // Extract image URL
        let imageURL = null;
        
        if (response.data.images && response.data.images.length > 0) {
            imageURL = response.data.images[0].url;
        } else if (response.data.output && response.data.output.length > 0) {
            imageURL = response.data.output[0];
        }
        
        if (!imageURL) {
            console.error('❌ No image URL in response');
            return res.status(500).json({
                error: 'Failed to generate wallpaper. Please try a different description.',
                code: 'GENERATION_FAILED'
            });
        }
        
        console.log('🎉 Image generated successfully:', imageURL);
        
        // Return success response
        res.json({
            success: true,
            image_url: imageURL,
            prompt_used: enhancedPrompt,
            user_id: user_id,
            generation_time: new Date().toISOString(),
            message: 'Beautiful nature wallpaper generated!'
        });
        
    } catch (error) {
        console.error('❌ Generation error:', error.message);
        
        let errorMessage = 'AI service temporarily unavailable. Please try again.';
        let statusCode = 500;
        
        if (error.response) {
            const status = error.response.status;
            console.error('🔴 API Error Status:', status);
            
            if (status === 401) {
                errorMessage = 'Service authentication error. Please contact support.';
                statusCode = 503;
            } else if (status === 429) {
                errorMessage = 'Daily generation limit reached. Please try again tomorrow!';
                statusCode = 429;
            }
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'Generation timeout. Please try a simpler description.';
        }
        
        res.status(statusCode).json({
            error: errorMessage,
            code: 'GENERATION_ERROR',
            timestamp: new Date().toISOString()
        });
    }
});

// Handle 404
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        available_endpoints: [
            'GET /',
            'GET /health',
            'POST /api/v1/generate-wallpaper'
        ]
    });
});

// Export for Vercel
module.exports = app;
