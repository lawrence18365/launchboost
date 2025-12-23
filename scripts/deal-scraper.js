/**
 * Ethical Deal Scraper for IndieSaasDeals
 * Use responsibly - respect rate limits and terms of service
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

class DealScraper {
  constructor() {
    this.delay = 2000; // 2 second delay between requests
    this.scrapedDeals = [];
  }

  async scrapeCompetitorDeals(url) {
    console.log(`Scraping deals from: ${url}`);
    
    try {
      await this.sleep(this.delay);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Generic selectors - adjust based on competitor site structure
      const deals = [];
      
      $('.deal-item, .product-card, .offer-card').each((i, element) => {
        const deal = this.extractDealData($, element);
        if (deal.title && deal.price) {
          deals.push(deal);
        }
      });

      console.log(`Found ${deals.length} deals`);
      return deals;
      
    } catch (error) {
      console.error(`Error scraping ${url}:`, error.message);
      return [];
    }
  }

  extractDealData($, element) {
    const $el = $(element);
    
    return {
      title: this.cleanText($el.find('h3, .title, .product-name').first().text()),
      description: this.cleanText($el.find('.description, .summary, p').first().text()),
      originalPrice: this.extractPrice($el.find('.original-price, .regular-price, .was').text()),
      dealPrice: this.extractPrice($el.find('.deal-price, .sale-price, .now').text()),
      discountCode: this.cleanText($el.find('.code, .coupon, .discount-code').text()),
      category: this.cleanText($el.find('.category, .tag').first().text()),
      imageUrl: $el.find('img').first().attr('src'),
      productUrl: $el.find('a').first().attr('href'),
      timeLeft: this.cleanText($el.find('.time-left, .expires').text())
    };
  }

  cleanText(text) {
    return text ? text.trim().replace(/\s+/g, ' ') : '';
  }

  extractPrice(priceText) {
    const match = priceText.match(/[\d,]+\.?\d*/);
    return match ? parseFloat(match[0].replace(',', '')) : null;
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async scrapeMultipleSites(urls) {
    for (const url of urls) {
      const deals = await this.scrapeCompetitorDeals(url);
      this.scrapedDeals.push(...deals);
    }
    
    return this.scrapedDeals;
  }

  exportToJSON(filename = 'scraped_deals.json') {
    fs.writeFileSync(filename, JSON.stringify(this.scrapedDeals, null, 2));
    console.log(`Exported ${this.scrapedDeals.length} deals to ${filename}`);
  }

  // Convert to your database format
  convertToIndieSaasFormat() {
    return this.scrapedDeals.map(deal => ({
      productName: deal.title,
      title: deal.title,
      description: deal.description || `Amazing deal on ${deal.title}`,
      shortDescription: deal.description ? deal.description.substring(0, 100) + '...' : `Get ${deal.title} at a great price`,
      category: deal.category || 'Productivity',
      originalPrice: deal.originalPrice || 99,
      dealPrice: deal.dealPrice || 49,
      discountCode: deal.discountCode,
      pricingTier: 'free',
      tags: [deal.category || 'saas', 'deal', 'startup'],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    })).filter(deal => deal.originalPrice && deal.dealPrice);
  }
}

// Usage example
async function main() {
  const scraper = new DealScraper();
  
  // Add your competitor URLs here
  const competitorUrls = [
    // 'https://competitor1.com/deals',
    // 'https://competitor2.com/offers',
    // Add the URL your competitor showed you
  ];
  
  console.log('Starting ethical deal scraping...');
  await scraper.scrapeMultipleSites(competitorUrls);
  
  scraper.exportToJSON();
  
  const formattedDeals = scraper.convertToIndieSaasFormat();
  fs.writeFileSync('deals_for_database.json', JSON.stringify(formattedDeals, null, 2));
  
  console.log(`Ready to import ${formattedDeals.length} deals to your database!`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DealScraper;