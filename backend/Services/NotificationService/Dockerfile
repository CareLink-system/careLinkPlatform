FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
EXPOSE 5008
COPY ./publish .
ENTRYPOINT ["dotnet", "NotificationService.dll"]