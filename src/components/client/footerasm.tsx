import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const FooterAsm = () => {
  return (
    <footer className="bg-black text-white py-10 mt-[100px]">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Exclusive */}
        <div>
          <h3 className="text-xl font-bold">Exclusive</h3>
          <p className="mt-4 text-gray-400">Subscribe</p>
          <p className="text-gray-500">Get 10% off your first order</p>
          <div className="mt-4 flex items-center border border-gray-500 rounded-full px-4 py-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-transparent outline-none text-white w-full"
            />
            <button className="ml-2 text-white">➜</button>
          </div>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-lg font-bold">Support</h3>
          <p className="mt-4 text-gray-500">
            111 Bijoy sarani, Dhaka, <br />
            DH 1515, Bangladesh.
          </p>
          <p className="mt-2 text-gray-500">exclusive@gmail.com</p>
          <p className="mt-2 text-gray-500">+88015-88888-9999</p>
        </div>

        {/* Account */}
        <div>
          <h3 className="text-lg font-bold">Account</h3>
          <ul className="mt-4 space-y-2 text-gray-500">
            <li>My Account</li>
            <li>Login / Register</li>
            <li>Cart</li>
            <li>Wishlist</li>
            <li>Shop</li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-bold">Quick Link</h3>
          <ul className="mt-4 space-y-2 text-gray-500">
            <li>Privacy Policy</li>
            <li>Terms Of Use</li>
            <li>FAQ</li>
            <li>Contact</li>
          </ul>
        </div>

        {/* Download App */}
        <div>
          <h3 className="text-lg font-bold">Download App</h3>
          <p className="mt-4 text-gray-500">Save $3 with App New User Only</p>
          <div className="mt-2 flex space-x-2">
            <div className="bg-white  rounded w-[80px] h-[80px]">
              <img src="/img/qr.png" alt="QR Code" className="w-[80px] h-[80px]" />
            </div>
            <div className="space-y-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="w-[140px] h-[35px]" />
              <img src="/img/appsto.jpg" alt="App Store" className="w-[140px] h-[30px]" />
            </div>
          </div>

          {/* Social Icons */}
          <div className="mt-4 flex space-x-4 text-gray-400">
            <FaFacebookF size={20} />
            <FaTwitter size={20} />
            <FaInstagram size={20} />
            <FaLinkedinIn size={20} />
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-10 border-t border-gray-700 pt-6 text-center text-gray-500">
        © Copyright Rimel 2022. All rights reserved
      </div>
    </footer>
  );
};

export default FooterAsm;
