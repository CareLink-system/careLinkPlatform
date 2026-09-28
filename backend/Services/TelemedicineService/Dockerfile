FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
EXPOSE 5007
COPY ./publish .
ENTRYPOINT ["dotnet", "TelemedicineService.dll"]