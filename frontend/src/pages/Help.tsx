export default function Help() {
  const faqs = [
    {
      question: 'How do I create a listing?',
      answer: 'Log in to your account, then click "Sell" in the navigation bar. Fill in the listing details — title, description, price, and an optional photo — then choose whether it\'s a fixed-price listing or an auction.',
    },
    {
      question: 'What is the difference between Husker Gear and Dorm Market?',
      answer: 'Husker Gear is for University of Nebraska merchandise, apparel, and sports items. Dorm Market is for general household and everyday items such as furniture, appliances, and textbooks.',
    },
    {
      question: 'How do auctions work?',
      answer: 'When you create an auction listing, you set a starting price and an end time. Other users can place bids, and the highest bidder when the auction ends wins the item. The listing is automatically closed by our system.',
    },
    {
      question: 'How do I place a bid?',
      answer: 'Open any auction listing by clicking on it. You will see a bid form pre-filled with the current highest bid + $1.00. You can adjust the amount and click "Place Bid" to submit.',
    },
    {
      question: 'Can I edit or delete my listing?',
      answer: 'Yes. Open your listing from "Your Listings" or any marketplace page. Click "Edit Listing" to update the title, description, market, or image. You can also delete the listing at any time.',
    },
    {
      question: 'How do I contact a seller?',
      answer: 'Open a listing and click "Message Seller". A message will be sent to the seller letting them know you\'re interested. Contact information exchange is handled between buyers and sellers directly.',
    },
    {
      question: 'How do I add an item to my cart?',
      answer: 'Open a fixed-price listing and click "Add to Cart". You can review your cart by clicking "Cart" in the navigation bar.',
    },
    {
      question: 'Is my account information secure?',
      answer: 'Yes. Passwords are hashed using bcrypt and never stored in plain text. Your account is protected by JWT-based authentication.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white shadow py-1 px-4 sm:px-6 lg:px-8 -mt-6 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="min-w-0 text-left">
          <h2 className="text-[26px] font-bold leading-none text-[#C8102E] sm:text-[32px] sm:truncate font-nebraska py-1 mt-1">
            Help Center
          </h2>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <p className="text-gray-600 mb-8 text-lg">
          Welcome to UNListings! Here are answers to common questions to help you get started.
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-[#C8102E]/5 border border-[#C8102E]/20 rounded-lg p-6">
          <h3 className="text-base font-semibold text-[#C8102E] mb-2">Still need help?</h3>
          <p className="text-sm text-gray-600">
            UNListings is a student-run marketplace for University of Nebraska students. If you have additional questions, reach out to the seller directly through the messaging system, or contact a site administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
