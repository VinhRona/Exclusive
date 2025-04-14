const NotFound = () => {
  return (
    <div>
      
      <div className="text-gray-500 text-sm mb-4 mt-10 pl-[125px]">
        Home <span className="mx-2">/</span> <span className="text-black">404 Error</span>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen text-center -mt-40">
        <h1 className="text-8xl font-bold mb-4">404 Not Found</h1>
        <p className="text-gray-500 mb-6 mt-5">
          Your visited page not found. You may go home page.
        </p>

        <a href="/asm/home">
        <button className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition mt-5">
          Back to home page
        </button>
        </a>
      </div>
    </div>
  );
};

export default NotFound;
