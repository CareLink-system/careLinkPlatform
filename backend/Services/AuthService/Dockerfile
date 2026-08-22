FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
EXPOSE 5002
COPY ./publish .
ENTRYPOINT ["dotnet", "AuthService.dll"]