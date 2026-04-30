namespace App\Providers;

    use Illuminate\Support\ServiceProvider;
    use Illuminate\Support\Facades\Schema; // Tambahkan ini

    class AppServiceProvider extends ServiceProvider
    {
        public function boot(): void
        {
            Schema::defaultStringLength(191); // Tambahkan ini
        }
    }