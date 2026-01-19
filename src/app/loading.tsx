import { Loader } from "lucide-react";
import Image from "next/image";

export default function Loading() {
    return (
        <div className="w-screen h-screen bg-gradient-to-br from-[#110B1C]/90 to-[#1C1329]/90 flex items-center justify-center">
            <div className="mx-auto max-w-sm text-center p-6 rounded-xl bg-[#1A1227]/70 shadow-xl backdrop-blur-md">
                {/* Logo */}
                <Image
                    className="mx-auto mb-6 animate-pulse"
                    src={"/mc-logo.png"}
                    alt="Logo"
                    width={200}
                    height={200}
                />

                {/* Loader & Text */}
                <div>
                    <h1 className="flex items-center justify-center gap-3 text-lg font-semibold text-white mb-2">
                        <Loader className="animate-spin text-white" size={24} />
                        <span>Loading...</span>
                    </h1>
                    <p className="text-sm text-[#E0DFF0]/80">
                        Please wait while we get things ready for you.
                    </p>
                </div>
            </div>
        </div>
    )
}