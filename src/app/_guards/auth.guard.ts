import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import { LocalStorageService } from '../_services/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private localStorageService: LocalStorageService) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    if (this.localStorageService.getItem('CION-USER-TOKEN') !== null) {
      return true;
    }

    await this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
    return false;
  }
}
