export function Footer() {
    return (
        <footer className="bg-white text-black py-32 px-8">
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
                <div>
                    <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[0.9]">Ready to <br />Integrate?</h2>
                    <p className="text-neutral-500 max-w-xs mb-12">Start your journey toward 100% deliverability today.</p>
                    <button className="btn-handcrafted !bg-black !text-white hover:!bg-neutral-800 hover:!text-white hover:scale-105 transform transition-all">Get API Key</button>
                </div>
                <div className="flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-8 label-mono !text-black">
                        <ul className="space-y-4">
                            <li className="font-bold">Protocol</li>
                            <li><a href="#" className="hover:text-neutral-500 transition-colors">Docs</a></li>
                            <li><a href="#" className="hover:text-neutral-500 transition-colors">Status</a></li>
                        </ul>
                        <ul className="space-y-4">
                            <li className="font-bold">Company</li>
                            <li><a href="#" className="hover:text-neutral-500 transition-colors">Privacy</a></li>
                            <li><a href="#" className="hover:text-neutral-500 transition-colors">Security</a></li>
                        </ul>
                    </div>
                    <div className="mt-20 label-mono !text-neutral-400">
                        © 2026 NoBounce Engine Lab — Handcrafted in Geneva.
                    </div>
                </div>
            </div>
        </footer>
    )
}
