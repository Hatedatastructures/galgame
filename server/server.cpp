#include "server.hpp"

#include <iostream>
#include <thread>
#include <filesystem>

int main()
{
  boost::asio::io_context io_context;
  server server(io_context, 6779);
  server.set_web_root((std::filesystem::path(__FILE__).parent_path() / "webroot").string());
  server.start();
  auto io_function = [&io_context]()
  {
    io_context.run();
    std::cout << "io_context.run() finished" << std::endl;
  };
  std::jthread thread(io_function);
  return 0;
}

// Linux静态编译

//  g++ -Wall -Wextra -g3 -std=c++23 -march=native -O2 -pthread server.cpp -o output/server -L/usr/lib/x86_64-linux-gnu 
//  -L/home/wang/桌面/galgame/server/zstd/lib -Wl,
//  --start-group -Wl,-Bstatic -lssl -lcrypto -lcryptopp -lboost_system -lboost_json -lz -lzstd -lpthread -ldl -lrt 
//  -Wl,-Bdynamic -Wl,--end-group -static-libstdc++ -static-libgcc -Wl,--warn-unresolved-symbols