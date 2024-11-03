import Image from "next/image";
import Link from "next/link";
import React from "react";

const HeaderLogo = () => {
  return (
    <Link href="/" className="flex items-center">
      <div className="flex items-center">
        <div className="bg-primary rounded-full p-2">
          <Image src={"/logo.svg"} alt="logo" width={28} height={28} />
        </div>
        <p className="font-bold text-3xl ml-2.5">Goobers</p>
      </div>
    </Link>
  );
};

export default HeaderLogo;
