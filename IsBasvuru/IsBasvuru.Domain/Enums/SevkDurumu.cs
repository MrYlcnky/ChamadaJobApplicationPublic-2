namespace IsBasvuru.Domain.Enums
{
    public enum SevkDurumu
    {
        Bekliyor = 1,                 // İK sevk etti, müdürün listesine düştü.
        Onaylandi = 2,                // Departman müdürü onayladı.
        Reddedildi = 3,               // Departman müdürü reddetti.
        BaskaDepartmanOnayladi = 4,    // Adayı aynı şubede başka bir departman onayladığı için bu pasife düştü.
        OnayUstAsamadaIptalEdildi = 5       // Departman aslında onaylamıştı; İK/GM/Mali aşamasında red geldiği için geçici iptal edildi.
    }
}