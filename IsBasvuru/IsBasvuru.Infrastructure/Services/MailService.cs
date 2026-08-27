using IsBasvuru.Domain.Interfaces;
using IsBasvuru.Domain.Wrappers;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Configuration;
using MimeKit;
using System;
using System.Globalization;
using System.Net;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.IO;

namespace IsBasvuru.Infrastructure.Services
{
    public class MailService : IMailService
    {
        private readonly IConfiguration _configuration;

        public MailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<ServiceResponse<bool>> DogrulamaKoduGonderAsync(string aliciEposta, string kod)
        {
            try
            {
                var emailSettings = _configuration.GetSection("EmailSettings");

                var smtpServer = GetRequiredSetting(emailSettings, "SmtpServer");
                var senderEmail = GetRequiredSetting(emailSettings, "SenderEmail");
                var senderPassword = GetRequiredSetting(emailSettings, "Password");
                var portValue = GetRequiredSetting(emailSettings, "Port");
                if (!int.TryParse(portValue, NumberStyles.Integer, CultureInfo.InvariantCulture, out var smtpPort))
                {
                    return ServiceResponse<bool>.FailureResult("SMTP port değeri geçerli değil.");
                }


                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("Chamada Hotels İnsan Kaynakları", senderEmail));
                message.To.Add(new MailboxAddress("", aliciEposta));
                message.Subject = "Chamada Hotels İş Başvurusu Doğrulama Kodunuz";

                message.Body = new TextPart("html")
                {
                    Text = $@"
<!DOCTYPE html>
<html lang='tr'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Chamada Hotels İş Başvurusu Doğrulama Kodu</title>
</head>
<body style='margin:0; padding:0; background-color:#eef2f7; font-family:Arial, Helvetica, sans-serif;'>

    <div style='display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;'>
        Chamada Hotels iş başvurunuza devam etmek için doğrulama kodunuz: {kod}
    </div>

    <table width='100%' cellpadding='0' cellspacing='0' border='0' style='background-color:#eef2f7; padding:32px 12px;'>
        <tr>
            <td align='center'>

                <table width='100%' cellpadding='0' cellspacing='0' border='0' style='max-width:600px; background-color:#ffffff; border-radius:22px; overflow:hidden; box-shadow:0 18px 45px rgba(15, 23, 42, 0.12);'>
                    
                    <tr>
                        <td style='background-color:#0f172a; padding:30px 32px; text-align:left;'>
                            <table width='100%' cellpadding='0' cellspacing='0' border='0'>
                                <tr>
                                    <td>
                                        <div style='font-size:12px; letter-spacing:2px; text-transform:uppercase; color:#93c5fd; font-weight:700; margin-bottom:8px;'>
                                            Chamada Hotels
                                        </div>

                                        <div style='font-size:24px; line-height:1.3; color:#ffffff; font-weight:800;'>
                                            İş Başvurusu Doğrulama Kodu
                                        </div>

                                        <div style='font-size:13px; line-height:1.6; color:#cbd5e1; margin-top:8px;'>
                                            Başvurunuzu güvenli şekilde tamamlamak için aşağıdaki kodu kullanabilirsiniz.
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style='padding:34px 32px 28px 32px; background-color:#ffffff;'>

                            <p style='margin:0 0 14px 0; font-size:16px; line-height:1.7; color:#111827; font-weight:700;'>
                                Merhaba,
                            </p>

                            <p style='margin:0; font-size:14px; line-height:1.8; color:#4b5563;'>
                                Chamada Hotels iş başvuru sisteminde e-posta adresinizi doğrulamak için aşağıdaki kodu kullanabilirsiniz.
                            </p>

                            <table width='100%' cellpadding='0' cellspacing='0' border='0' style='margin:30px 0;'>
                                <tr>
                                    <td align='center'>
                                        <div style='display:inline-block; background-color:#f8fafc; border:1px solid #dbeafe; border-radius:18px; padding:14px;'>
                                            <div style='background-color:#ffffff; border:1px solid #bfdbfe; border-radius:14px; padding:20px 34px; box-shadow:0 10px 24px rgba(37, 99, 235, 0.10);'>
                                                <div style='font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:#64748b; font-weight:700; margin-bottom:10px; text-align:center;'>
                                                    Doğrulama Kodunuz
                                                </div>

                                                <div style='font-size:36px; line-height:1; font-weight:900; letter-spacing:10px; color:#1d4ed8; text-align:center;'>
                                                    {kod}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <table width='100%' cellpadding='0' cellspacing='0' border='0' style='background-color:#f8fafc; border:1px solid #e5e7eb; border-radius:14px;'>
                                <tr>
                                    <td style='padding:16px 18px;'>
                                        <p style='margin:0 0 8px 0; font-size:13px; line-height:1.6; color:#374151;'>
                                            <strong>Geçerlilik süresi:</strong> Bu kod yalnızca <strong>3 dakika</strong> boyunca geçerlidir.
                                        </p>

                                        <p style='margin:0; font-size:13px; line-height:1.6; color:#6b7280;'>
                                            Güvenliğiniz için bu kodu kimseyle paylaşmayınız. Chamada Hotels yetkilileri sizden doğrulama kodunuzu istemez.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style='margin:22px 0 0 0; font-size:12px; line-height:1.7; color:#9ca3af;'>
                                Eğer bu işlemi siz başlatmadıysanız bu e-postayı dikkate almayabilirsiniz.
                            </p>

                        </td>
                    </tr>

                    <tr>
                        <td style='background-color:#f9fafb; border-top:1px solid #e5e7eb; padding:20px 32px; text-align:center;'>
                            <p style='margin:0 0 6px 0; font-size:12px; color:#6b7280; font-weight:700;'>
                                Chamada Hotels İnsan Kaynakları
                            </p>

                            <p style='margin:0; font-size:11px; line-height:1.6; color:#9ca3af;'>
                                Bu e-posta Chamada Hotels iş başvuru sistemi tarafından otomatik gönderilmiştir.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>"
                };

                using (var client = new SmtpClient())
                {
                    await client.ConnectAsync(smtpServer, smtpPort, false);
                    await client.AuthenticateAsync(senderEmail, senderPassword);
                    await client.SendAsync(message);
                    await client.DisconnectAsync(true);
                }

                return ServiceResponse<bool>.SuccessResult(true, "Mail başarıyla gönderildi.");
            }
            catch (Exception ex)
            {
                return ServiceResponse<bool>.FailureResult($"Mail gönderim hatası");
            }
        }





        private static string GetRequiredSetting(IConfigurationSection section, string key)
        {
            var value = section[key];
            if (string.IsNullOrWhiteSpace(value))
            {
                throw new InvalidOperationException($"EmailSettings:{key} yapılandırması bulunamadı veya boş.");
            }

            return value;
        }




          private async Task<ServiceResponse<bool>> HtmlMailGonderAsync(string aliciEposta, string konu, string htmlBody)
        {
            try
            {
                var emailSettings = _configuration.GetSection("EmailSettings");

                var smtpServer = GetRequiredSetting(emailSettings, "SmtpServer");
                var senderEmail = GetRequiredSetting(emailSettings, "SenderEmail");
                var senderPassword = GetRequiredSetting(emailSettings, "Password");
                var portValue = GetRequiredSetting(emailSettings, "Port");

                if (!int.TryParse(portValue, NumberStyles.Integer, CultureInfo.InvariantCulture, out var smtpPort))
                {
                    return ServiceResponse<bool>.FailureResult("SMTP port değeri geçerli değil.");
                }

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("Chamada Hotels İnsan Kaynakları", senderEmail));
                message.To.Add(new MailboxAddress("", aliciEposta));
                message.Subject = konu;

                message.Body = new TextPart("html")
                {
                    Text = htmlBody
                };

                using var client = new SmtpClient();
                await client.ConnectAsync(smtpServer, smtpPort, false);
                await client.AuthenticateAsync(senderEmail, senderPassword);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                return ServiceResponse<bool>.SuccessResult(true, "Mail başarıyla gönderildi.");
            }
            catch (Exception ex)
            {
                return ServiceResponse<bool>.FailureResult($"Mail gönderim hatası");
            }
        }



        public async Task<ServiceResponse<bool>> BasvuruAlindiMailiGonderAsync(string aliciEposta, string adSoyad)
        {
            var guvenliAdSoyad = WebUtility.HtmlEncode(
                string.IsNullOrWhiteSpace(adSoyad) ? "Değerli Adayımız" : adSoyad
            );

            var subject = "Chamada Hotels İş Başvurunuz Alındı";

            var htmlBody = $@"
<!DOCTYPE html>
<html lang='tr'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Chamada Hotels İş Başvurunuz Alındı</title>
</head>
<body style='margin:0; padding:0; background-color:#eef2f7; font-family:Arial, Helvetica, sans-serif;'>

    <div style='display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;'>
        Chamada Hotels iş başvurunuz başarıyla alınmıştır.
    </div>

    <table width='100%' cellpadding='0' cellspacing='0' border='0' style='background-color:#eef2f7; padding:32px 12px;'>
        <tr>
            <td align='center'>

                <table width='100%' cellpadding='0' cellspacing='0' border='0' style='max-width:640px; background-color:#ffffff; border-radius:22px; overflow:hidden; box-shadow:0 18px 45px rgba(15, 23, 42, 0.12);'>

                    <tr>
                        <td style='background-color:#0f172a; padding:30px 32px; text-align:left;'>
                            <div style='font-size:12px; letter-spacing:2px; text-transform:uppercase; color:#93c5fd; font-weight:700; margin-bottom:8px;'>
                                Chamada Hotels
                            </div>

                            <div style='font-size:24px; line-height:1.3; color:#ffffff; font-weight:800;'>
                                İş Başvurunuz Alındı
                            </div>

                            <div style='font-size:13px; line-height:1.6; color:#cbd5e1; margin-top:8px;'>
                                Başvurunuz İnsan Kaynakları değerlendirme sürecine alınmıştır.
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style='padding:34px 32px 30px 32px; background-color:#ffffff; color:#374151; font-size:14px; line-height:1.8;'>

                            <p style='margin:0 0 18px 0; color:#111827; font-size:16px; font-weight:700;'>
                                Sayın {guvenliAdSoyad},
                            </p>

                            <p style='margin:0 0 16px 0;'>
                                Chamada Hotels iş başvuru sistemine iletmiş olduğunuz başvurunuz başarıyla alınmıştır.
                            </p>

                            <p style='margin:0 0 16px 0;'>
                                Başvurunuz, İnsan Kaynakları Departmanı tarafından ilgili pozisyon, departman ihtiyaçları ve değerlendirme kriterleri doğrultusunda incelenecektir.
                            </p>

                            <table width='100%' cellpadding='0' cellspacing='0' border='0' style='margin:26px 0; background-color:#f8fafc; border:1px solid #e5e7eb; border-radius:16px;'>
                                <tr>
                                    <td style='padding:18px 20px;'>
                                        <p style='margin:0 0 8px 0; font-size:13px; color:#111827; font-weight:700;'>
                                            Süreç Bilgilendirmesi
                                        </p>

                                        <p style='margin:0; font-size:13px; line-height:1.7; color:#6b7280;'>
                                            Başvurunuzun değerlendirme süreciyle ilgili gerekli görülmesi halinde İnsan Kaynakları Departmanı tarafından sizinle iletişime geçilecektir.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style='margin:0 0 16px 0;'>
                                Şirketimize göstermiş olduğunuz ilgi ve başvuru sürecimize ayırmış olduğunuz zaman için teşekkür ederiz.
                            </p>

                            <p style='margin:0 0 4px 0;'>
                                Bilgilerinize sunarız.
                            </p>

                            <p style='margin:0; color:#111827; font-weight:700;'>
                                Saygılarımızla,<br/>
                                Chamada Hotels İnsan Kaynakları Departmanı
                            </p>

                        </td>
                    </tr>

                    <tr>
                        <td style='background-color:#f9fafb; border-top:1px solid #e5e7eb; padding:20px 32px; text-align:center;'>
                            <p style='margin:0 0 6px 0; font-size:12px; color:#6b7280; font-weight:700;'>
                                Chamada Hotels İnsan Kaynakları
                            </p>

                            <p style='margin:0; font-size:11px; line-height:1.6; color:#9ca3af;'>
                                Bu e-posta Chamada Hotels iş başvuru sistemi tarafından otomatik gönderilmiştir.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>";

            return await HtmlMailGonderAsync(aliciEposta, subject, htmlBody);
        }

        public async Task<ServiceResponse<bool>> OlumsuzGeriDonusMailiGonderAsync(string aliciEposta, string adSoyad)
        {
            var guvenliAdSoyad = WebUtility.HtmlEncode(
                string.IsNullOrWhiteSpace(adSoyad) ? "Değerli Adayımız" : adSoyad
            );

            var subject = "Başvurunuz Hakkında Bilgilendirme";

            var htmlBody = $@"
<!DOCTYPE html>
<html lang='tr'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Başvurunuz Hakkında Bilgilendirme</title>
</head>
<body style='margin:0; padding:0; background-color:#eef2f7; font-family:Arial, Helvetica, sans-serif;'>

    <div style='display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;'>
        Chamada Hotels iş başvurunuz hakkında bilgilendirme.
    </div>

    <table width='100%' cellpadding='0' cellspacing='0' border='0' style='background-color:#eef2f7; padding:32px 12px;'>
        <tr>
            <td align='center'>

                <table width='100%' cellpadding='0' cellspacing='0' border='0' style='max-width:640px; background-color:#ffffff; border-radius:22px; overflow:hidden; box-shadow:0 18px 45px rgba(15, 23, 42, 0.12);'>

                    <tr>
                        <td style='background-color:#0f172a; padding:30px 32px; text-align:left;'>
                            <div style='font-size:12px; letter-spacing:2px; text-transform:uppercase; color:#fca5a5; font-weight:700; margin-bottom:8px;'>
                                Chamada Hotels
                            </div>

                            <div style='font-size:24px; line-height:1.3; color:#ffffff; font-weight:800;'>
                                Başvurunuz Hakkında Bilgilendirme
                            </div>

                            <div style='font-size:13px; line-height:1.6; color:#cbd5e1; margin-top:8px;'>
                                İş başvuru sürecinizle ilgili değerlendirme sonucu
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style='padding:34px 32px 30px 32px; background-color:#ffffff; color:#374151; font-size:14px; line-height:1.8;'>

                            <p style='margin:0 0 18px 0; color:#111827; font-size:16px; font-weight:700;'>
                                Sayın {guvenliAdSoyad},
                            </p>

                            <p style='margin:0 0 16px 0;'>
                                Şirketimize göstermiş olduğunuz ilgi ve başvuru sürecimize ayırmış olduğunuz değerli zaman için teşekkür ederiz.
                            </p>

                            <p style='margin:0 0 16px 0;'>
                                Başvurunuz, ilgili departman tarafından pozisyonun gereklilikleri, mevcut ihtiyaçlar ve değerlendirme kriterleri kapsamında titizlikle incelenmiştir.
                            </p>

                            <table width='100%' cellpadding='0' cellspacing='0' border='0' style='margin:26px 0; background-color:#fff7ed; border:1px solid #fed7aa; border-radius:16px;'>
                                <tr>
                                    <td style='padding:18px 20px;'>
                                        <p style='margin:0 0 8px 0; font-size:13px; color:#9a3412; font-weight:700;'>
                                            Değerlendirme Sonucu
                                        </p>

                                        <p style='margin:0; font-size:13px; line-height:1.7; color:#7c2d12;'>
                                            Yapılan değerlendirme sonucunda, bu aşamada başvurunuzun ilgili pozisyon için ilerletilemeyeceğini üzülerek belirtmek isteriz.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style='margin:0 0 16px 0;'>
                                Bu karar, yalnızca mevcut pozisyon ihtiyaçları ve değerlendirme süreci kapsamında alınmış olup, kariyer yetkinliklerinizin genel bir değerlendirmesi niteliği taşımamaktadır.
                            </p>

                            <p style='margin:0 0 22px 0;'>
                                Şirketimize göstermiş olduğunuz ilgi için tekrar teşekkür eder, kariyer yolculuğunuzda başarılar dileriz.
                            </p>

                            <p style='margin:0; color:#111827; font-weight:700;'>
                                Saygılarımızla,<br/>
                                Chamada Hotels İnsan Kaynakları Departmanı
                            </p>

                        </td>
                    </tr>

                    <tr>
                        <td style='background-color:#f9fafb; border-top:1px solid #e5e7eb; padding:20px 32px; text-align:center;'>
                            <p style='margin:0 0 6px 0; font-size:12px; color:#6b7280; font-weight:700;'>
                                Chamada Hotels İnsan Kaynakları
                            </p>

                            <p style='margin:0; font-size:11px; line-height:1.6; color:#9ca3af;'>
                                Bu e-posta Chamada Hotels iş başvuru sistemi tarafından otomatik gönderilmiştir.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>";

            return await HtmlMailGonderAsync(aliciEposta, subject, htmlBody);
        }



        public async Task<ServiceResponse<bool>> YedeklemeMailiGonderAsync( List<string> alicilar, string driveLink, string zipDosyaAdi, string? sqlDosyaYolu, bool sqlDosyasiEklensinMi)
        {
            try
            {
                if (alicilar == null || alicilar.Count == 0)
                {
                    return ServiceResponse<bool>.FailureResult(
                        "Yedekleme maili için aktif alıcı bulunamadı.");
                }

                if (string.IsNullOrWhiteSpace(driveLink))
                {
                    return ServiceResponse<bool>.FailureResult(
                        "Google Drive yedekleme bağlantısı bulunamadı.");
                }

                var emailSettings =
                    _configuration.GetSection("EmailSettings");

                var smtpServer =
                    GetRequiredSetting(emailSettings, "SmtpServer");

                var senderEmail =
                    GetRequiredSetting(emailSettings, "SenderEmail");

                var senderPassword =
                    GetRequiredSetting(emailSettings, "Password");

                var portValue =
                    GetRequiredSetting(emailSettings, "Port");

                if (!int.TryParse(
                    portValue,
                    NumberStyles.Integer,
                    CultureInfo.InvariantCulture,
                    out var smtpPort))
                {
                    return ServiceResponse<bool>.FailureResult(
                        "SMTP port değeri geçerli değil.");
                }

                var message = new MimeMessage();

                message.From.Add(
                    new MailboxAddress(
                        "Chamada Job Application Backup",
                        senderEmail));

                // Alıcıların birbirlerinin adresini görmemesi için BCC.
                foreach (var alici in alicilar)
                {
                    if (string.IsNullOrWhiteSpace(alici))
                        continue;

                    message.Bcc.Add(
                        new MailboxAddress(
                            "",
                            alici.Trim()));
                }

                if (message.Bcc.Count == 0)
                {
                    return ServiceResponse<bool>.FailureResult(
                        "Geçerli yedekleme mail alıcısı bulunamadı.");
                }

                // Bazı mail sunucularında yalnızca BCC sorun çıkarabildiği için
                // gönderen adresini TO alanına ekliyoruz.
                message.To.Add(
                    new MailboxAddress(
                        "Chamada Job Application Backup",
                        senderEmail));

                message.Subject =
                    $"Chamada Job Application Yedekleme - {DateTime.Now:dd.MM.yyyy HH:mm}";

                var guvenliDriveLink =
                    WebUtility.HtmlEncode(driveLink);

                var guvenliZipDosyaAdi =
                    WebUtility.HtmlEncode(zipDosyaAdi);

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = $@"
<!DOCTYPE html>
<html lang='tr'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Chamada Job Application Backup</title>
</head>

<body style='margin:0; padding:0; background-color:#eef2f7; font-family:Arial, Helvetica, sans-serif;'>

    <table width='100%' cellpadding='0' cellspacing='0' border='0'
           style='background-color:#eef2f7; padding:32px 12px;'>

        <tr>
            <td align='center'>

                <table width='100%' cellpadding='0' cellspacing='0' border='0'
                       style='max-width:640px;
                              background-color:#ffffff;
                              border-radius:20px;
                              overflow:hidden;
                              box-shadow:0 18px 45px rgba(15,23,42,0.12);'>

                    <tr>
                        <td style='background-color:#0f172a;
                                   padding:30px 32px;'>

                            <div style='font-size:12px;
                                        letter-spacing:2px;
                                        text-transform:uppercase;
                                        color:#93c5fd;
                                        font-weight:700;
                                        margin-bottom:8px;'>
                                Chamada Hotels
                            </div>

                            <div style='font-size:24px;
                                        color:#ffffff;
                                        font-weight:800;'>
                                Sistem Yedekleme Tamamlandı
                            </div>

                            <div style='font-size:13px;
                                        color:#cbd5e1;
                                        margin-top:8px;
                                        line-height:1.6;'>
                                Chamada Job Application sistem yedeği başarıyla oluşturuldu.
                            </div>

                        </td>
                    </tr>

                    <tr>
                        <td style='padding:32px;
                                   color:#374151;
                                   font-size:14px;
                                   line-height:1.8;'>

                            <p style='margin:0 0 20px 0;'>
                                Sistem veritabanı ve dosya yedeği başarıyla
                                oluşturularak Google Drive'a yüklenmiştir.
                            </p>

                            <table width='100%'
                                   cellpadding='0'
                                   cellspacing='0'
                                   border='0'
                                   style='background-color:#f8fafc;
                                          border:1px solid #e5e7eb;
                                          border-radius:14px;
                                          margin-bottom:24px;'>

                                <tr>
                                    <td style='padding:18px 20px;'>

                                        <div style='font-size:12px;
                                                    color:#64748b;
                                                    margin-bottom:5px;'>
                                            Yedek Dosyası
                                        </div>

                                        <div style='font-size:14px;
                                                    color:#111827;
                                                    font-weight:700;'>
                                            {guvenliZipDosyaAdi}
                                        </div>

                                        <div style='font-size:12px;
                                                    color:#64748b;
                                                    margin-top:14px;
                                                    margin-bottom:5px;'>
                                            Yedekleme Tarihi
                                        </div>

                                        <div style='font-size:14px;
                                                    color:#111827;
                                                    font-weight:700;'>
                                            {DateTime.Now:dd.MM.yyyy HH:mm}
                                        </div>

                                    </td>
                                </tr>

                            </table>

                            <table width='100%'
                                   cellpadding='0'
                                   cellspacing='0'
                                   border='0'>

                                <tr>
                                    <td align='center'>

                                        <a href='{guvenliDriveLink}'
                                           style='display:inline-block;
                                                  padding:14px 24px;
                                                  background-color:#2563eb;
                                                  color:#ffffff;
                                                  text-decoration:none;
                                                  font-size:14px;
                                                  font-weight:700;
                                                  border-radius:10px;'>
                                            Google Drive Yedeğini Aç
                                        </a>

                                    </td>
                                </tr>

                            </table>

                            <p style='margin:26px 0 0 0;
                                      font-size:12px;
                                      line-height:1.7;
                                      color:#64748b;'>
                                Bu bağlantıya yalnızca Google Drive üzerinde
                                yetkilendirilmiş kullanıcılar erişebilir.
                            </p>

                            <p style='margin:10px 0 0 0;
                                      font-size:12px;
                                      line-height:1.7;
                                      color:#64748b;'>

                                {(sqlDosyasiEklensinMi
                                            ? "Veritabanı SQL yedeği ayrıca bu e-postaya eklenmiştir."
                                            : "Veritabanı SQL yedeği e-posta boyut sınırı nedeniyle eklenmemiştir. Tam yedek Google Drive üzerinden erişilebilir.")}

                            </p>

                        </td>
                    </tr>

                    <tr>
                        <td style='background-color:#f9fafb;
                                   border-top:1px solid #e5e7eb;
                                   padding:20px 32px;
                                   text-align:center;'>

                            <p style='margin:0;
                                      font-size:11px;
                                      line-height:1.6;
                                      color:#9ca3af;'>
                                Bu e-posta Chamada Job Application Backup sistemi
                                tarafından otomatik olarak gönderilmiştir.
                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>

    </table>

</body>
</html>"
                };

                // ---------------------------------------------------------
                // SQL ATTACHMENT
                // ---------------------------------------------------------

                if (sqlDosyasiEklensinMi)
                {
                    if (string.IsNullOrWhiteSpace(sqlDosyaYolu) ||
                        !File.Exists(sqlDosyaYolu))
                    {
                        return ServiceResponse<bool>.FailureResult(
                            "Mail eki olarak gönderilecek SQL dosyası bulunamadı.");
                    }

                    await bodyBuilder.Attachments.AddAsync(
                        sqlDosyaYolu);
                }

                message.Body = bodyBuilder.ToMessageBody();

                // ---------------------------------------------------------
                // SMTP
                // ---------------------------------------------------------

                using var client = new SmtpClient();

                await client.ConnectAsync(
                    smtpServer,
                    smtpPort,
                    false);

                await client.AuthenticateAsync(
                    senderEmail,
                    senderPassword);

                await client.SendAsync(message);

                await client.DisconnectAsync(true);

                return ServiceResponse<bool>.SuccessResult(
                    true,
                    "Yedekleme maili başarıyla gönderildi.");
            }
            catch (Exception ex)
            {
                return ServiceResponse<bool>.FailureResult(
                    $"Yedekleme maili gönderim hatası");
            }
        }
    }
}