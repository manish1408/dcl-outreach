import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './_guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'leads', pathMatch: 'full' },
  // {
  //   path: '',
  //   loadChildren: () =>
  //     import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  //   canActivate: [AuthGuard],
  // },

  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'files-data',
    loadChildren: () =>
      import('./files-and-data/files-and-data.module').then(
        (m) => m.FilesAndDataModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'chatbots',
    loadChildren: () =>
      import('./chatbots/chatbots.module').then((m) => m.ChatbotsModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'theme',
    loadChildren: () =>
      import('./theme/theme.module').then((m) => m.ThemeModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./settings/settings.module').then((m) => m.SettingsModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'visitors',
    loadChildren: () =>
      import('./visitors/visitors.module').then((m) => m.VisitorsModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'signup',
    loadChildren: () =>
      import('./signup/signup.module').then((m) => m.SignupModule),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./signin/signin.module').then((m) => m.SigninModule),
  },
  {
    path: 'verify-email',
    loadChildren: () =>
      import('./verify-email/verify-email.module').then(
        (m) => m.VerifyEmailModule
      ),
  },
  {
    path: 'forgot-password',
    loadChildren: () =>
      import('./forgot-password/forgot-password.module').then(
        (m) => m.ForgotPasswordModule
      ),
  },
  {
    path: 'change-password',
    loadChildren: () =>
      import('./change-password/change-password.module').then(
        (m) => m.ChangePasswordModule
      ),
  },
  { path: 'all-chatbots', loadChildren: () => import('./all-chatbots/all-chatbots.module').then(m => m.AllChatbotsModule) },
  { path: 'all-users', loadChildren: () => import('./all-users/all-users.module').then(m => m.AllUsersModule) },
  { path: 'installation', loadChildren: () => import('./installation/installation.module').then(m => m.InstallationModule) },
  { path: 'workflows', loadChildren: () => import('./workflows/workflows.module').then(m => m.WorkflowsModule) },
  { path: 'guidance', loadChildren: () => import('./guidance/guidance.module').then(m => m.GuidanceModule) },
  { path: 'conversations', loadChildren: () => import('./conversations/conversations.module').then(m => m.ConversationsModule) },
  { path: 'interactions', loadChildren: () => import('./interactions/interactions.module').then(m => m.InteractionsModule) },
  { path: 'loan-automation', loadChildren: () => import('./loan-automation/loan-automation.module').then(m => m.LoanAutomationModule) },
  { path: 'leads', loadChildren: () => import('./customers/customers.module').then(m => m.CustomersModule) },
  { path: 'workflowsJab', loadChildren: () => import('./workflows-jab/workflows-jab.module').then(m => m.WorkflowsJabModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
