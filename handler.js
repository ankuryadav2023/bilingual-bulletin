const axios = require('axios');
const { response } = require('./response');
require('dotenv').config();

exports.getNews = async () => {
  try {
    const response1 = await axios.get(`https://newsapi.org/v2/top-headlines?apiKey=${process.env.NEWSAPI_API_KEY}&pageSize=2&page=1&country=us`);

    let articles = await Promise.all(response1.data.articles.map(async (article) => {
      const options = {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_API_KEY,
          'x-rapidapi-host': 'deep-translate1.p.rapidapi.com',
          'Content-Type': 'application/json'
        }
      };
      const body1 = {
        q: article.title,
        source: 'en',
        target: 'hi'
      };
      const body2 = {
        q: article.description,
        source: 'en',
        target: 'hi'
      };
      const response21 = await axios.post('https://deep-translate1.p.rapidapi.com/language/translate/v2', body1, options);
      const response22 = await axios.post('https://deep-translate1.p.rapidapi.com/language/translate/v2', body2, options);

      return {
        source: article.source.name,
        author: article.author,
        english: {
          title: article.title,
          description: article.description
        },
        hindi: {
          title: response21.data.data.translations.translatedText,
          description: response22.data.data.translations.translatedText
        },
        urlToArticle: article.url
      };
    }));

    const lambdaFunctionBody = {
      articles
    };
    return response._200(lambdaFunctionBody);
  } catch (error) {
    const lambdaFunctionBody = {
      error: 'Sorry! Some Error Occured.\n' + error.message
    };
    return response._400(lambdaFunctionBody);
  }
};
