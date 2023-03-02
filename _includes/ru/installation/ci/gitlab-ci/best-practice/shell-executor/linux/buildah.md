## Требования

- GitLab;

- Linux-хост для установки GitLab Runner, имеющий:
  
  - Bash;
  
  - Git версии 2.18.0 или выше;
  
  - GPG.

## Установка GitLab Runner

Установите GitLab Runner на выделенный для него хост, следуя [официальным инструкциям](https://docs.gitlab.com/runner/install/linux-repository.html).

## Установка Buildah

Для установки Buildah выполните следующие инструкции на хосте для GitLab Runner:

* Установите пакет Buildah, следуя [официальным инструкциям](https://github.com/containers/buildah/blob/main/install.md), но не производите его дальнейшую настройку. Если для вашего дистрибутива нет готовых пакетов Buildah, используйте следующие инструкции:
  
  {% offtopic title="Ручная установка Buildah" %}
  
  - Установите пакеты, предоставляющие программы `newuidmap` и `newgidmap`.
  
  - Убедитесь, что программы `newuidmap` и `newgidmap` имеют корректные права:
    
    ```yaml
    sudo setcap cap_setuid+ep /usr/bin/newuidmap
    sudo setcap cap_setgid+ep /usr/bin/newgidmap
    sudo chmod u-s,g-s /usr/bin/newuidmap /usr/bin/newgidmap
    ```
  
  - Установите пакет, предоставляющий файлы `/etc/subuid` и `/etc/subgid`.
  
  - Убедитесь, что в файлах `/etc/subuid` и `/etc/subgid` имеется строка вида `gitlab-runner:1000000:65536`, где:
    
    * `gitlab-runner` — имя пользователя GitLab Runner;
    
    * `1000000` — первый subUID/subGID в выделяемом диапазоне;
    
    * `65536` — размер диапазона subUIDs/subGIDs (минимум `65536`).
    
    Избегайте коллизий с другими диапазонами, если они имеются. Изменение файлов может потребовать перезагрузки. Подробнее в `man subuid` и `man subgid`.
  
  {% endofftopic %}

* (Для Linux 5.12 и ниже) Установите пакет, предоставляющий программу `fuse-overlayfs`.

* Убедитесь, что путь `/home/gitlab-runner/.local/share/containers` создан и пользователь `gitlab-runner` имеет доступ на чтение и запись.

* Команда `sysctl -ne kernel.unprivileged_userns_clone` НЕ должна вернуть `0`, а иначе выполните `echo 'kernel.unprivileged_userns_clone = 1' | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`.

* Команда `sysctl -n user.max_user_namespaces` должна вернуть `15000` или больше, а иначе выполните `echo 'user.max_user_namespaces = 15000' | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`.

## Установка werf

Для установки werf, на хосте для GitLab Runner выполните:

```
curl -sSL https://werf.io/install.sh | bash -s -- --ci
```

## Регистрация GitLab Runner

Для регистрации GitLab Runner в GitLab следуйте [официальным инструкциям](https://docs.gitlab.com/runner/register/index.html), указав Shell в качестве executor'а. При желании после регистрации произведите [дополнительную конфигурацию](https://docs.gitlab.com/runner/configuration/advanced-configuration.html) GitLab Runner'а.

## Настройка проекта GitLab

- Включите [требование удачно выполненного pipeline для merge requests](https://docs.gitlab.com/ee/user/project/merge_requests/merge_when_pipeline_succeeds.html#require-a-successful-pipeline-for-merge).

- Включите [возможность автоматически отменять лишние pipelines](https://docs.gitlab.com/ee/ci/pipelines/settings.html#auto-cancel-redundant-pipelines).

- [Создайте и сохраните access token](https://docs.gitlab.com/ee/user/project/settings/project_access_tokens.html#create-a-project-access-token) для очистки ненужных образов из container registry со следующей конфигурацией:
  
  - **Token name:** `werf-images-cleanup`
  
  - **Role:** `developer`
  
  - **Scopes:** `api`

- [В переменных проекта](https://docs.gitlab.com/ee/ci/variables/#for-a-project) добавьте следующие переменные:
  
  - Версия werf:
    
    - **Key:** `WERF_VERSION`
    
    - **Value:** `{{ include.version }} {{ include.channel }}`
  
  - Access token для очистки ненужных образов:
    
    - **Key:** `WERF_IMAGES_CLEANUP_PASSWORD`
    
    - **Value:** `<сохранённый "werf-images-cleanup" access token>`
    
    - **Protect variable:** `yes`
    
    - **Mask variable:** `yes`

- [Добавьте плановое задание](https://docs.gitlab.com/ee/ci/pipelines/schedules.html#add-a-pipeline-schedule) на каждую ночь для очистки ненужных образов в container registry, указав ветку `main`/`master` в качестве **Target branch**.

## Конфигурация CI/CD проекта

TODO

## TODO

* ```
  WERF_BUILDAH_MODE=auto
  ```
