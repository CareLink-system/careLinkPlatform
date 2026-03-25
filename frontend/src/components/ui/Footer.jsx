import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-[#0B2699] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-lg font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="transition-colors hover:text-[#4B7BFF] focus:outline-none focus:ring-2 focus:ring-[#4B7BFF]/30 rounded-sm">About</a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-[#4B7BFF] focus:outline-none focus:ring-2 focus:ring-[#4B7BFF]/30 rounded-sm">Careers</a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-[#4B7BFF] focus:outline-none focus:ring-2 focus:ring-[#4B7BFF]/30 rounded-sm">Press</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-3">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="transition-colors hover:text-[#4B7BFF] focus:outline-none focus:ring-2 focus:ring-[#4B7BFF]/30 rounded-sm">Find a Doctor</a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-[#4B7BFF] focus:outline-none focus:ring-2 focus:ring-[#4B7BFF]/30 rounded-sm">Book Appointment</a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-[#4B7BFF] focus:outline-none focus:ring-2 focus:ring-[#4B7BFF]/30 rounded-sm">Telemedicine</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="transition-colors hover:text-[#4B7BFF] focus:outline-none focus:ring-2 focus:ring-[#4B7BFF]/30 rounded-sm">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-[#4B7BFF] focus:outline-none focus:ring-2 focus:ring-[#4B7BFF]/30 rounded-sm">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-[#4B7BFF] focus:outline-none focus:ring-2 focus:ring-[#4B7BFF]/30 rounded-sm">Security</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-sm">Email: <a href="mailto:hello@carelink.example" className="underline hover:text-[#4B7BFF] transition-colors">hello@carelink.example</a></li>
              <li className="text-sm">Phone: <a href="tel:+1234567890" className="hover:text-[#4B7BFF] transition-colors">+1 (234) 567-890</a></li>
              <li className="text-sm">Address: 123 Care St, Suite 100</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-sm flex flex-col md:flex-row items-center justify-between">
          <p>© {new Date().getFullYear()} CareLink. All rights reserved.</p>
          <p className="mt-3 md:mt-0 text-sm text-white/80">Designed for care, built with precision.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
