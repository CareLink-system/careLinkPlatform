using MassTransit;
using NotificationService.Events;

namespace NotificationService.Consumers;

public class PaymentCreatedConsumer : IConsumer<PaymentCreatedEvent>
{
    public Task Consume(ConsumeContext<PaymentCreatedEvent> context)
    {
        var evt = context.Message;
        Console.WriteLine($"[NotificationService] Received PaymentCreatedEvent: paymentId={evt.PaymentId}, amount={evt.Amount} {evt.Currency}, status={evt.Status}");
        // TODO: send email/SMS/push notification to user or audit record

        return Task.CompletedTask;
    }
}
