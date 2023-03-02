## Требования

* PowerShell;
- Git версии 2.18.0 или выше;

- GPG;

- [Docker Engine](https://docs.docker.com/engine/install/).

## Подготовка системы

Выдайте пользователю права на создание символьных ссылок следуя [этим инструкциям](https://superuser.com/a/105381), либо выполнив в PowerShell от администратора следующее:

{% offtopic title="Выдать пользователю права с PowerShell" %}

```powershell
$ntprincipal = new-object System.Security.Principal.NTAccount "$env:UserName"
$sidstr = $ntprincipal.Translate([System.Security.Principal.SecurityIdentifier]).Value.ToString()
$tmp = [System.IO.Path]::GetTempFileName()
secedit.exe /export /cfg "$($tmp)"
$currentSetting = ""
foreach($s in (Get-Content -Path $tmp)) {
  if ($s -like "SECreateSymbolicLinkPrivilege*") {
      $x = $s.split("=",[System.StringSplitOptions]::RemoveEmptyEntries)
      $currentSetting = $x[1].Trim()
  }
}
if ($currentSetting -notlike "*$($sidstr)*") {
  if ([string]::IsNullOrEmpty($currentSetting)) {
      $currentSetting = "*$($sidstr)"
  } else {
      $currentSetting = "*$($sidstr),$($currentSetting)"
  }
  $tmp2 = [System.IO.Path]::GetTempFileName()
  @"
[Unicode]
Unicode=yes
[Version]
signature="`$CHICAGO`$"
Revision=1
[Privilege Rights]
SECreateSymbolicLinkPrivilege = $($currentSetting)
"@ | Set-Content -Path $tmp2 -Encoding Unicode -Force
  cd (Split-Path $tmp2)
  secedit.exe /configure /db "secedit.sdb" /cfg "$($tmp2)" /areas USER_RIGHTS
}
gpupdate /force
```

{% endofftopic %}

## Установка werf

* [Установите trdl](https://github.com/werf/trdl/releases/) в `<диск>:\Users\<имя пользователя>\bin\trdl`.

* Добавьте директорию `<диск>:\Users\<имя пользователя>\bin\` в постоянную переменную окружения `$PATH`.

* Выполните команду:
  
  ```powershell
  trdl add werf https://tuf.werf.io 1 b7ff6bcbe598e072a86d595a3621924c8612c7e6dc6a82e919abe89707d7e3f468e616b5635630680dd1e98fc362ae5051728406700e6274c5ed1ad92bea52a2
  ```

* В [$PROFILE-файл](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_profiles) добавьте следующую команду:
  
  ```powershell
  . $(trdl use werf {{ include.version }} {{ include.channel }})
  ```
