namespace AuthService.Exceptions;

public class UserAlreadyExistsException : Exception
{
    public UserAlreadyExistsException(string message) : base(message) { }
}

public class UserNotFoundException : Exception
{
    public UserNotFoundException(string message) : base(message) { }
}

public class InvalidCredentialsException : Exception
{
    public InvalidCredentialsException(string message) : base(message) { }
}

public class PasswordMismatchException : Exception
{
    public PasswordMismatchException(string message) : base(message) { }
}

public class DuplicateEmailException : Exception
{
    public DuplicateEmailException(string message) : base(message) { }
}

public class InvalidUserDataException : Exception
{
    public InvalidUserDataException(string message) : base(message) { }
}
