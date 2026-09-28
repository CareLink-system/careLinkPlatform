FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
EXPOSE 8080
COPY ./publish .
ENTRYPOINT ["dotnet", "ApiGateway.dll"]